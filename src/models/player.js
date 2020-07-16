const BaseModel = require('./base-model');
const { BadRequestError } = require('../static/errors');

class Player extends BaseModel {
  constructor(body = {}) {
    super(body);

    if (!body.name) {
      throw new BadRequestError('Player must have a name');
    }

    if (body.main_character) {
      this.main_character = body.main_character.toLowerCase();
    }
  }

  static get modelName() {
    return 'player';
  }

  static get schema() {
    return ['id', 'name', 'email', 'status', 'password', 'main_character'];
  }

  static get readSchema() {
    return ['id', 'email', 'name'];
  }
}

module.exports = Player;
