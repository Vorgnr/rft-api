class PlayerController {
  constructor({ repository }) {
    this.repository = repository;
  }

  async create(body) {
    const player = await this.repository.create(body);
    return player.toJson();
  }
}

module.exports = PlayerController;
