const BaseModel = require('./base-model');

class Match extends BaseModel {
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
    ];
  }

  static get readSchema() {
    return this.schema;
  }
}

module.exports = Match;
