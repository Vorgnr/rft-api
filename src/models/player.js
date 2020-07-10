const BaseModel = require('./base-model');

class Player extends BaseModel {
  static get modelName() {
    return 'player';
  }
}

module.exports = Player;
