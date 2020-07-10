class PlayerController {
  constructor({ repository }) {
    this.repository = repository;
  }

  async create(body) {
    return this.repository.create(body);
  }
}

module.exports = PlayerController;
