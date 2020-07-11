const { NotFoundError } = require('../static/errors');

class BaseController {
  constructor({ repository, model }) {
    this.repository = repository;
    this.Model = model;
  }

  async get(id) {
    const entity = await this.repository.get(id);
    if (!entity) {
      throw new NotFoundError(`${this.Model.modelName} not found`);
    }
    return entity.toJson();
  }

  async update(id, body) {
    await this.get(id);
    const updated = await this.repository.update(id, body);
    return updated.toJson();
  }

  async create(body) {
    const entity = await this.repository.create(body);
    return entity.toJson();
  }
}

module.exports = BaseController;
