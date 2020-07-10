const debug = require('debug')('rft:repository');

class Repository {
  constructor(knex, model) {
    this.knex = knex;
    this.Model = model;
  }

  async create(body) {
    debug('%s create() request', this.Model.modelName);
    const model = new this.Model(body);
    const toSave = model.toJson();
    const raw = await this.knex(this.Model.modelName)
      .insert(toSave)

    debug('create() response %j', model);
    return model;
  }
}

module.exports = Repository;
