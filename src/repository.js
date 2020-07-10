const debug = require('debug')('repository');

class Repository {
  constructor(knex, model) {
    this.knex = knex;
    this.Model = model;
  }

  async create(body) {
    debug('%s create() request', this.Model.modelName);
    const raw = await this.knex(this.Model.modelName)
      .insert(body);

    return raw;

    return new this.Model(raw);
  }
}

module.exports = Repository;
