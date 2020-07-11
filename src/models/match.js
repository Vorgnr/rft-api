const BaseModel = require('./base-model');
const { BadRequestError } = require('../static/errors');

class Match extends BaseModel {
  constructor(body = {}) {
    super(body);

    if (this.player1_score === this.ft || this.player2_score === this.ft) {
      if (this.player1_score === this.player2_score) {
        throw new BadRequestError();
      } else {
        this.complete();
      }
    }
  }

  complete() {
    this.player2_score = this.player2_score || 0;
    this.player1_score = this.player1_score || 0;
    this.completed_at = Date.now();
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
