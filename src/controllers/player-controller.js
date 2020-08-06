const debug = require('debug');

const log = debug('rft:repository:player');
const mailLog = debug('rft:mail');
const BaseController = require('./base-controller');
const Player = require('../models/player');
const Mailer = require('../utils/mail');
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

  async update(id, payload) {
    const player = await this.get(id);
    const changedKeys = Object.keys(payload).filter((k) => player[k] !== payload[k]);
    if (!changedKeys.length) {
      return player;
    }
    const body = pick(payload, changedKeys);
    if (body.name) {
      const players = await this.repository.list({
        filters: (qb) => {
          qb.whereRaw('lower(name) = ?', [body.name.toLowerCase()]);
        },
      });

      if (players.length) {
        throw new BadRequestError('Player name must be unique');
      }
    }

    if (body.email) {
      const email = body.email.trim().toLowerCase();
      const playerWithSameEmail = await this.repository.get({ email });

      if (playerWithSameEmail) {
        throw new BadRequestError('Player email must be unique');
      }
    }
    return this.repository.update(id, body);
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
      player.hashPassword();
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

    if (!player.comparePassword(password)) {
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
      || (withElo && [{ column: 'elo.value', order: 'desc' }, { column: 'player.name', order: 'desc' }]);

    const items = await this.repository.list({
      filters: cleanFilters, page, perPage, orderBy: cleanOrderBy, leftOuterJoin,
    });

    return items.map((item) => {
      if (withElo) {
        const { elo, player } = item;
        return {
          elo,
          player: pick(player, Player.readSchema),
        };
      }

      return pick(item, Player.readSchema);
    });
  }

  async recoverPasswordRequest(body) {
    if (!body || !body.email) {
      throw new BadRequestError('Request must contains an email');
    }

    const { email } = body;
    const player = await this.repository.get({ email });
    if (player && player.email) {
      player.requestPasswordRecover();
      await this.repository.update(player.id, player);
      await Mailer.send(player.email, 'PASSWORD_RECOVER', player)
        .catch((err) => {
          mailLog('Unable to send mail got error %j', err);
        });
    } else {
      log('Unable to request password recover of %s', body);
    }
    return {};
  }

  async recoverPassword(body) {
    if (!body || !body.token || !body.password) {
      throw new BadRequestError('Request must contains an token and password');
    }

    const { token, password } = body;
    const player = await this.repository.get({ password_recover_request: token });
    if (!player) {
      throw new BadRequestError('Recovery does not exist');
    }
    player.password = password;
    player.hashPassword();
    await this.repository.update(player.id, { password: player.password });
    return {};
  }
}

module.exports = PlayerController;
