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

    if (this.player1_id === this.player2_id) {
      throw new BadRequestError('Player can not fight himself. Tyler');
    }

    if (this.player1_ragequit || this.player2_ragequit) {
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

  complete() {
    this.completed_at = format(Date.now(), 'yyyy-MM-dd HH:mm:ss');
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
    };

    const player2 = {
      id: this.player2_id,
      isPlayer1: false,
      score: this.player2_score,
      ragequit: this.player2_ragequit,
    };

    if (this.player2_ragequit || this.player1_score > this.player2_score) {
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
      'player2_elo',
      'player1_score',
      'player2_score',
      'player1_ragequit',
      'player2_ragequit',
      'completed_at',
    ];
  }

  static get readSchema() {
    return this.schema;
  }
}

module.exports = Match;
