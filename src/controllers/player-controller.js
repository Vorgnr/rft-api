const BaseController = require('./base-controller');
const Player = require('../models/player');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../static/errors');
const { pick } = require('../utils/object');

class PlayerController extends BaseController {
  async get(id) {
    const entity = await this.repository.get({ id });
    if (!entity) {
      throw new NotFoundError(`${this.Model.modelName} not found`);
    }
    return pick(entity.toJson(), Player.readSchema);
  }

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

    if (body.email) {
      const email = body.email.trim().toLowerCase();
      const playerWithSameEmail = await this.repository.get({ email });

      if (playerWithSameEmail) {
        throw new BadRequestError('Player email must be unique');
      }
    }

    let toSave = body;
    if (body.password) {
      await player.hashPassword();
      toSave = {
        ...body,
        password: player.password,
      };
    }

    const entity = await this.repository.create(toSave);
    return pick(entity.toJson(), Player.readSchema);
  }

  async authenticate({ email, password }) {
    const wrongId = 'Mauvais mot de passe ou email inconnu';
    const player = await this.repository.get({ email });
    if (!player) {
      throw new UnauthorizedError(wrongId);
    }

    if (!await player.comparePassword(password)) {
      throw new UnauthorizedError(wrongId);
    }

    return pick(player, Player.readSchema);
  }

  async list({
    filters, page, perPage, orderBy, withElo,
  }) {
    let leftOuterJoin;
    if (withElo) {
      leftOuterJoin = {
        table: 'elo',
        join: (qb) => {
          qb.on('player.id', '=', 'elo.player_id');
        },
      };
    }

    const cleanFilters = (qb) => {
      if (filters.league_id) {
        qb.whereRaw('(league_id = ? or league_id is NULL)', [filters.league_id]);
      }
      if (filters.name) {
        qb.whereRaw('lower(player.name) like ?', [`%${filters.name.trim().toLowerCase()}%`]);
      }
    };

    const cleanOrderBy = orderBy
      || (withElo && ['elo.value', 'desc']);

    const items = await this.repository.list({
      filters: cleanFilters, page, perPage, orderBy: cleanOrderBy, leftOuterJoin,
    });

    return items.map(({ elo, player }) => ({
      elo,
      player: pick(player, Player.readSchema),
    }));
  }
}

module.exports = PlayerController;
