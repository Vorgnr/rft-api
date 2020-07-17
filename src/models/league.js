const BaseModel = require('./base-model');
const { BadRequestError } = require('../static/errors');

class League extends BaseModel {
  constructor(body = {}) {
    super(body);

    if (!body.rank_treshold > 0) {
      throw new BadRequestError('League rank_treshold must be > 0');
    }
  }

  static get modelName() {
    return 'league';
  }

  static get schema() {
    return [
      'id',
      'name',
      'is_active',
      'starting_elo',
      'winning_base_elo',
      'losing_base_elo',
      'ragequit_penalty',
      'rank_treshold',
      'rank_diff_ratio',
    ];
  }

  static get readSchema() {
    return this.schema;
  }
}

module.exports = League;
