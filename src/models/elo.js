const BaseModel = require('./base-model');

class Elo extends BaseModel {
  static get modelName() {
    return 'elo';
  }

  static get schema() {
    return ['id', 'value', 'player_id', 'league_id', 'played_matches'];
  }

  static get readSchema() {
    return this.schema;
  }
}

module.exports = Elo;
