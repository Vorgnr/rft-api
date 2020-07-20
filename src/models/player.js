const bcrypt = require('bcrypt');
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

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(plainText) {
    return bcrypt.compare(plainText, this.password);
  }

  static get modelName() {
    return 'player';
  }

  static get schema() {
    return ['id', 'name', 'email', 'password', 'main_character', 'is_admin', 'is_frozen'];
  }

  static get readSchema() {
    return ['id', 'email', 'name', 'main_character', 'is_admin', 'is_frozen'];
  }
}

module.exports = Player;
