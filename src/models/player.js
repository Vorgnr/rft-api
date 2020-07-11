const BaseModel = require('./base-model');

class Player extends BaseModel {
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
