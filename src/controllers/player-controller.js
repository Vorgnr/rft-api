const { NotFoundError } = require('../static/errors');

class PlayerController {
  constructor({ repository }) {
    this.repository = repository;
  }

  async get(id) {
    const player = await this.repository.get(id);
    if (!player) {
      throw new NotFoundError('Player not found');
    }
    return player.toJson();
  }

  async update(id, body) {
    await this.get(id);
    const updated = await this.repository.update(id, body);
    return updated.toJson();
  }

  async create(body) {
    const player = await this.repository.create(body);
    return player.toJson();
  }
}

module.exports = PlayerController;
