const BaseController = require('./base-controller');
const Match = require('../models/match');

const playerGetElo = (player, elos, league) => {
  const elo = elos.filter((e) => e.player_id === player.id)[0];
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
    }

    toBeUpdated.player1_elo = winner.isPlayer1 ? winningElo : -losingElo;
    toBeUpdated.player1_previous_elo = winnerElo.value;
    toBeUpdated.player2_elo = winner.isPlayer1 ? -losingElo : winningElo;
    toBeUpdated.player2_previous_elo = loserElo.value;

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
    const match = new Match({ ...body });
    let toBeCreated = body;

    if (match.completed_at) {
      toBeCreated = await this.distributeElo(match, body);
    }

    const createdMatch = await this.repository.create(toBeCreated);
    return new Match({ ...match, ...createdMatch }).toJson();
  }

  async update(id, body) {
    const matchBefore = await this.get(id);
    const match = new Match({ ...matchBefore, ...body });
    let toBeUpdated = body;

    if (!matchBefore.completed_at && match.completed_at) {
      toBeUpdated = await this.distributeElo(match, body);
    }
    const updatedMatch = await this.repository.update(id, toBeUpdated);
    return new Match({ ...match, ...updatedMatch }).toJson();
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
    };

    const cleanOrderBy = orderBy
    || ['match.created_at', 'desc'];

    return this.repository.list({
      filters: cleanFilters, page, perPage, orderBy: cleanOrderBy, innerJoins,
    });
  }
}

module.exports = MatchController;
