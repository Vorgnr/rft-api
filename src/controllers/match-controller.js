const BaseController = require('./base-controller');
const Match = require('../models/match');
const Player = require('../models/player');
const { pick, omit } = require('../utils/object');
const { InternalServerError } = require('../static/errors');

const playerGetElo = (player, elos, league) => {
  const eloss = elos.filter((e) => e.player_id === player.id && e.league_id === league.id);
  const elo = eloss[0];
  if (elo) {
    return {
      hasElo: true,
      value: elo.value,
      id: elo.id,
      played_matches: elo.played_matches,
    };
  }

  return {
    hasElo: false,
    value: league.starting_elo,
  };
};

const playerGetRank = (playerElo, league) => Math.floor(playerElo / league.rank_treshold);

const updateElo = async (EloController, {
  winnerElo, winner, league, winningElo, loser, loserElo, losingElo,
}) => {
  if (!winnerElo.hasElo) {
    await EloController.create({
      player_id: winner.id,
      league_id: league.id,
      value: winnerElo.value + winningElo,
      played_matches: 1,
    });
  } else {
    await EloController.update(winnerElo.id, {
      value: winnerElo.value + winningElo,
      played_matches: winnerElo.played_matches + 1,
    });
  }

  const looserFinalElo = loserElo.value - losingElo < 0
    ? 0 : loserElo.value - losingElo;
  if (!loserElo.hasElo) {
    await EloController.create({
      player_id: loser.id,
      league_id: league.id,
      value: looserFinalElo,
      played_matches: 1,
    });
  } else {
    await EloController.update(loserElo.id, {
      value: looserFinalElo,
      played_matches: loserElo.played_matches + 1,
    });
  }
};

class MatchController extends BaseController {
  async distributeElo(match, body) {
    const toBeUpdated = { ...body };
    const league = await this.controllers.LeagueController.get(match.league_id);
    const elos = await this.controllers.EloController.list({
      filters: (builder) => {
        builder.where('league_id', league.id);
        builder.where('player_id', 'in', [match.player1_id, match.player2_id]);
      },
    });
    const { winner, loser } = match.getResults();
    const winnerElo = playerGetElo(winner, elos, league);
    const winnerRank = playerGetRank(winnerElo.value, league);
    const loserElo = playerGetElo(loser, elos, league);
    const looserRank = playerGetRank(loserElo.value, league);
    const rankDiff = Math.abs(looserRank - winnerRank);

    let winningElo;
    let losingElo;

    if (winnerRank > looserRank) {
      winningElo = Number.parseInt((league.winning_base_elo / (1 + winnerRank + rankDiff)), 10);
      losingElo = winningElo;
    } else {
      winningElo = Number.parseInt((league.winning_base_elo / (1 + winnerRank)) + rankDiff * league.rank_diff_ratio, 10);
      losingElo = Number.parseInt((league.winning_base_elo / (1 + looserRank)) + rankDiff * league.rank_diff_ratio, 10);
    }

    if (loser.ragequit) {
      losingElo += league.ragequit_penalty;
    } else if (loser.forfeit) {
      winningElo = 0;
    }

    toBeUpdated.player1_elo = winner.isPlayer1 ? winningElo : -losingElo;
    toBeUpdated.player1_previous_elo = winner.isPlayer1 ? winnerElo.value : loserElo.value;
    toBeUpdated.player2_elo = winner.isPlayer1 ? -losingElo : winningElo;
    toBeUpdated.player2_previous_elo = winner.isPlayer1 ? loserElo.value : winnerElo.value;

    await updateElo(this.controllers.EloController, {
      winnerElo,
      winner,
      league,
      winningElo,
      loser,
      loserElo,
      losingElo,
    });

    return toBeUpdated;
  }

  async create(body) {
    const cleanBody = omit(Match.customInternalKeys, body);
    const match = new Match({ ...cleanBody });
    const createdMatch = await this.repository.create(cleanBody);
    return new Match({ ...match, ...createdMatch }).toJson();
  }

  async update(id, payload) {
    const matchBefore = await this.get(id);
    const cleanBody = omit(Match.customInternalKeys, payload);
    const changedKeys = Object.keys(payload).filter((k) => matchBefore[k] !== cleanBody[k]);
    if (!changedKeys.length) {
      return matchBefore;
    }
    const body = pick(cleanBody, changedKeys);
    const match = new Match({ ...matchBefore, ...body });
    const updatedMatch = await this.repository.update(id, match);
    return new Match({ ...match, ...updatedMatch }).toJson();
  }

  async moderate(id) {
    const match = new Match(await this.get(id));
    match.moderate();
    const toBeUpdated = await this.distributeElo(match, { moderated_at: match.moderated_at });
    const updatedMatch = await this.repository.update(id, toBeUpdated);
    return new Match({ ...match, ...updatedMatch }).toJson();
  }

  async unmoderate(id) {
    const match = new Match(await this.get(id));
    const { player1Elo, player2Elo } = match.unmoderate();
    const elos = await this.controllers.EloController.list({
      filters: (builder) => {
        builder.where('league_id', match.league_id);
        builder.where('player_id', 'in', [match.player1_id, match.player2_id]);
      },
    });
    if (elos.length !== 2) {
      throw new InternalServerError('Unexpected elo records count');
    }
    await Promise.all(elos.map(async (elo) => this.controllers.EloController.update(elo.id, {
      value: elo.value - (elo.player_id === match.player1_id ? player1Elo : player2Elo),
      played_matches: elo.played_matches - 1,
    })));
    await this.repository.update(id, match);
    return new Match({ ...match }).toJson();
  }

  async cancel(id) {
    const match = new Match(await this.get(id));
    match.cancel();
    await this.repository.update(id, match);
    return match.toJson();
  }

  async penalize(id, body = {}) {
    const match = new Match(await this.get(id));
    const {
      player1_elo_penalty: p1penalty,
      player2_elo_penalty: p2penalty,
      comment,
    } = body;
    const elo = match.penalize({
      player1_elo_penalty: p1penalty,
      player2_elo_penalty: p2penalty,
      comment,
    });
    if (elo.shouldDistribute) {
      await Promise.all(elo.values.map(async (e) => {
        const elos = await this.controllers.EloController.list({
          filters: (builder) => {
            builder.where('league_id', e.league_id);
            builder.where('player_id', e.player_id);
          },
        });

        if (elos.length !== 1) {
          throw new InternalServerError('Unexpected elo records count');
        }

        const current = elos[0];
        return this.controllers.EloController.update(current.id, {
          value: current.value - e.penalty,
        });
      }));
      return this.repository.update(id, match);
    }
    return match;
  }

  async list({
    filters, page, perPage, orderBy,
  }) {
    const innerJoins = [
      {
        table: 'player as player1',
        join: (qb) => {
          qb.on('player1.id', '=', 'match.player1_id');
        },
      },
      {
        table: 'player as player2',
        join: (qb) => {
          qb.on('player2.id', '=', 'match.player2_id');
        },
      },
    ];

    const cleanFilters = (qb) => {
      qb.where('match.is_canceled', '=', 0);

      if (filters.matchId) {
        qb.where('match.id', '=', filters.matchId);
      }

      if (filters.name) {
        const searchName = `%${filters.name.trim().toLowerCase()}%`;
        qb.whereRaw('((lower(player1.name) like ? or lower(player2.name) like ?))',
          [searchName, searchName]);
      }

      if (filters.league_id) {
        qb.where('league_id', '=', filters.league_id);
      }

      if (filters.moderated_at === '0') {
        qb.where('moderated_at', 'is', null);
      } else if (filters.moderated_at === '1') {
        qb.where('moderated_at', 'is not', null);
      }

      if (filters.completed_at === '0') {
        qb.where('completed_at', 'is', null);
      } else if (filters.completed_at === '1') {
        qb.where('completed_at', 'is not', null);
      }
    };

    const cleanOrderBy = orderBy
    || [{ column: 'match.updated_at', order: 'desc' }];

    const items = await this.repository.list({
      filters: cleanFilters, page, perPage, orderBy: cleanOrderBy, innerJoins,
    });

    return items.map(({ match, player1, player2 }) => ({
      match: Match.toJson(match),
      player1: pick(player1, Player.readSchema),
      player2: pick(player2, Player.readSchema),
    }));
  }
}

module.exports = MatchController;
