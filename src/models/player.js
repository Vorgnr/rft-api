const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
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

  hashPassword() {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }

  requestPasswordRecover() {
    this.password_recover_request = uuidv4();
  }

  comparePassword(plainText) {
    return bcrypt.compareSync(plainText, this.password);
  }

  static get modelName() {
    return 'player';
  }

  static get schema() {
    return ['id', 'name', 'email', 'password', 'main_character', 'is_admin', 'is_frozen', 'password_recover_request'];
  }

  static get readSchema() {
    return ['id', 'email', 'name', 'main_character', 'is_admin', 'is_frozen'];
  }
}

module.exports = Player;
