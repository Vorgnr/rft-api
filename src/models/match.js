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
    console.log('this.ft', this.ft);
    const ft = validScore(this.ft);
    if (ft === false || ft === 0) {
      throw new BadRequestError('Match ft must be positive integer');
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
          this.complete(score1, score2);
        }
      }
    }
  }

  complete() {
    this.completed_at = Date.now();
    this.isCompleted = true;
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
    ];
  }

  static get readSchema() {
    return this.schema;
  }
}

module.exports = Match;
