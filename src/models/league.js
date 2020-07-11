const BaseModel = require('./base-model');

class League extends BaseModel {
  static get modelName() {
    return 'league';
  }

  static get schema() {
    return ['id', 'name', 'starting_elo'];
  }

  static get readSchema() {
    return this.schema;
  }
}

module.exports = League;
