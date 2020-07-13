const BaseModel = require('./base-model');

class League extends BaseModel {
  static get modelName() {
    return 'league';
  }

  static get schema() {
    return [
      'id',
      'name',
      'starting_elo',
      'winning_base_elo',
      'losing_base_elo',
      'ragequit_penalty',
      'rank_treshold',
    ];
  }

  static get readSchema() {
    return this.schema;
  }
}

module.exports = League;
