const BaseController = require('./base-controller');
const Player = require('../models/player');
const { BadRequestError } = require('../static/errors');

class PlayerController extends BaseController {
  async create(body) {
    const player = new Player(body);
    const players = await this.list({
      filters: (qb) => {
        qb.whereRaw('lower(name) = ?', [player.name.toLowerCase()]);
      },
    });

    if (players.length) {
      throw new BadRequestError('Player name must be unique');
    }

    return super.create(body);
  }
}

module.exports = PlayerController;
