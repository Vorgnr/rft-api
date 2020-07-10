const BaseModel = require('./base-model');

class Player extends BaseModel {
  static get modelName() {
    return 'player';
  }

  static get schema() {
    return ['name', 'email']
  }
}

module.exports = Player;
