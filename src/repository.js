const debug = require('debug')('rft:repository');

class Repository {
  constructor(knex, model) {
    this.knex = knex;
    this.Model = model;
  }

  async get(id) {
    debug('%s get(%s) request', this.Model.modelName, id);
    const model = await this.knex(this.Model.modelName)
      .where({ id })
      .select(this.Model.readSchema);

    debug('get(%s) response %j', id, model);
    if (model[0]) {
      return new this.Model(model[0]);
    }
    return undefined;
  }

  async create(body) {
    debug('%s create() request', this.Model.modelName);
    const model = new this.Model(body);
    const toSave = model.toJson();
    await this.knex(this.Model.modelName)
      .insert(toSave);

    debug('create() response %j', model);
    return model;
  }

  async update(id, body) {
    debug('%s update(%s) request %j', this.Model.modelName, id, body);
    const model = new this.Model({ id, ...body });
    await this.knex(this.Model.modelName)
      .where({ id })
      .update(model.toUpdateJson());

    debug('update() response %j', model);
    return model;
  }
}

module.exports = Repository;
