const format = require('date-fns/format');
const BaseModel = require('./base-model');
const { BadRequestError } = require('../static/errors');

const validScore = (score) => {
  const parsed = Number.parseInt(score, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return false;
  }
  return parsed;
};

const computePenalty = (penalty, { playerEloPenalty, playerElo }) => {
  const initialp1 = playerEloPenalty || 0;
  let cleanPenalty = penalty - initialp1;
  if (cleanPenalty > playerElo) {
    cleanPenalty = playerElo;
  }

  if (cleanPenalty < 0) {
    cleanPenalty = 0;
  }

  return {
    penalty: cleanPenalty,
    playerEloPenalty: initialp1 + cleanPenalty,
    playerElo: playerElo - cleanPenalty,
  };
};

class Match extends BaseModel {
  constructor(body = {}) {
    super(body);

    if (!this.completed_at) {
      this.validMatch();
    }
  }

  validMatch() {
    const ft = validScore(this.ft);
    if (ft === false || ft === 0) {
      throw new BadRequestError('Match ft must be positive integer');
    }

    if (!this.player1_id || !this.player2_id) {
      throw new BadRequestError('Player 1 and 2 Ids are required');
    }

    if (this.player1_id === this.player2_id) {
      throw new BadRequestError('Player can not fight himself. Tyler');
    }

    if (this.player1_ragequit || this.player2_ragequit || this.player2_forfeit || this.player1_forfeit) {
      this.complete();
    }

    if (this.player1_score || this.player2_score) {
      const score1 = validScore(this.player1_score);
      const score2 = validScore(this.player2_score);
      if (score1 === false || score2 === false) {
        throw new BadRequestError('Players scores must be positive integer');
      }

      if (score1 > ft || score2 > ft) {
        throw new BadRequestError('Players scores must be inferior or egal to match ft');
      }

      if (score1 === ft || score2 === ft) {
        if (score1 === score2) {
          throw new BadRequestError('Players scores can not both reach match ft');
        } else {
          this.complete();
        }
      }
    }
  }

  cancel() {
    if (this.moderated_at) {
      throw new BadRequestError('Can not cancel moderated match');
    }
    this.is_canceled = true;
  }

  moderate() {
    if (!this.completed_at) {
      throw new BadRequestError('Can not moderate not completed match');
    }

    this.moderated_at = format(Date.now(), 'yyyy-MM-dd HH:mm:ss');
    this.updated_at = this.moderated_at;
  }

  unmoderate() {
    if (!this.moderated_at) {
      throw new BadRequestError('Can not unmoderate not moderated match');
    }

    const { player1_elo: player1Elo, player2_elo: player2Elo } = this;

    this.moderated_at = null;
    this.player1_elo = null;
    this.player1_previous_elo = null;
    this.player2_previous_elo = null;
    this.player2_elo = null;
    this.updated_at = this.moderated_at;
    return { player1Elo, player2Elo };
  }

  penalize({ player1_elo_penalty: p1penalty, player2_elo_penalty: p2penalty }) {
    if (!this.moderated_at) {
      throw new BadRequestError('Can not penalize not moderated match');
    }

    const result = { shouldDistribute: false, values: [] };
    const computedP1penalty = computePenalty(p1penalty, {
      playerEloPenalty: this.player1_elo_penalty,
      playerElo: this.player1_elo,
    });

    if (computedP1penalty.penalty > 0) {
      result.shouldDistribute = true;
      result.values.push({
        league_id: this.league_id,
        player_id: this.player1_id,
        penalty: computedP1penalty.penalty,
      });
      this.player1_elo_penalty = computedP1penalty.playerEloPenalty;
      this.player1_elo = computedP1penalty.playerElo;
    }

    const computedP2penalty = computePenalty(p2penalty, {
      playerEloPenalty: this.player2_elo_penalty,
      playerElo: this.player2_elo,
    });

    if (computedP2penalty.penalty > 0) {
      result.shouldDistribute = true;
      result.values.push({
        league_id: this.league_id,
        player_id: this.player2_id,
        penalty: computedP2penalty.penalty,
      });
      this.player2_elo_penalty = computedP2penalty.playerEloPenalty;
      this.player2_elo = computedP2penalty.playerElo;
    }
    return result;
  }

  complete() {
    this.completed_at = format(Date.now(), 'yyyy-MM-dd HH:mm:ss');
    this.updated_at = this.completed_at;
  }

  isPlayer1Won() {
    if (this.player2_ragequit || this.player2_forfeit) {
      return true;
    }

    if (this.player1_ragequit || this.player1_forfeit) {
      return false;
    }

    if (this.player1_score > this.player2_score) {
      return true;
    }

    return false;
  }

  getResults() {
    if (!this.completed_at) {
      return false;
    }

    const player1 = {
      id: this.player1_id,
      isPlayer1: true,
      score: this.player1_score,
      ragequit: this.player1_ragequit,
      forfeit: this.player1_forfeit,
    };

    const player2 = {
      id: this.player2_id,
      isPlayer1: false,
      score: this.player2_score,
      ragequit: this.player2_ragequit,
      forfeit: this.player2_forfeit,
    };

    if (this.isPlayer1Won()) {
      return { winner: player1, loser: player2 };
    }

    return { winner: player2, loser: player1 };
  }

  static get modelName() {
    return 'match';
  }

  static get schema() {
    return [
      'id',
      'character1',
      'character2',
      'ft',
      'status',
      'league_id',
      'player1_id',
      'player2_id',
      'player1_elo',
      'player1_previous_elo',
      'player2_elo',
      'player2_previous_elo',
      'player1_score',
      'player2_score',
      'player1_ragequit',
      'player1_forfeit',
      'player2_ragequit',
      'player2_forfeit',
      'player1_elo_penalty',
      'player2_elo_penalty',
      'comment',
      'is_canceled',
      'video',
      'completed_at',
      'moderated_at',
      'updated_at',
    ];
  }

  static get readSchema() {
    return this.schema;
  }

  static get customInternalKeys() {
    return ['is_canceled', 'moderated_at', 'id', 'updated_at'];
  }

  static toUpdateJson(instance) {
    let { video } = instance;
    if (typeof video === 'object') {
      video = JSON.stringify(instance.video);
    }
    return super.toUpdateJson({ ...instance, video });
  }

  static toJson(instance) {
    return new Match(instance).toJson();
  }

  toJson() {
    if (typeof this.video === 'string') {
      this.video = JSON.parse(this.video);
    }
    return super.toJson();
  }
}

module.exports = Match;
