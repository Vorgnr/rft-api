const BaseModel = require('./base-model');
const { BadRequestError } = require('../static/errors');

class Player extends BaseModel {
  constructor(body = {}) {
    super(body);

    if (!body.name) {
      throw new BadRequestError('Player must have a name');
    }
  }

  static get modelName() {
    return 'player';
  }

  static get schema() {
    return ['id', 'name', 'email', 'status', 'password'];
  }

  static get readSchema() {
    return ['id', 'email', 'name'];
  }
}

module.exports = Player;
