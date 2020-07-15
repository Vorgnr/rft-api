const BaseController = require('./base-controller');
const Player = require('../models/player');
const { BadRequestError } = require('../static/errors');

class PlayerController extends BaseController {
  async create(body) {
    const player = new Player(body);
    const players = await this.repository.list({
      filters: (qb) => {
        qb.whereRaw('lower(name) = ?', [player.name.toLowerCase()]);
      },
    });

    if (players.length) {
      throw new BadRequestError('Player name must be unique');
    }

    return super.create(body);
  }

  async list({
    filters, page, perPage, orderBy,
  }) {
    const leftOuterJoin = {
      table: 'elo',
      join: (qb) => {
        qb.on('player.id', '=', 'elo.player_id');
      },
    };

    const cleanFilters = (qb) => {
      if (filters.name) {
        qb.whereRaw('name like \'%??%\'', [filters.name]);
      }
      if (filters.league_id) {
        qb.where('league_id', filters.league_id)
          .orWhere('league_id', 'is', null);
      }
    };

    return this.repository.list({
      filters: cleanFilters, page, perPage, orderBy, leftOuterJoin,
    });
  }
}

module.exports = PlayerController;
