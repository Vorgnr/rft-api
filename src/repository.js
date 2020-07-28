const debug = require('debug')('rft:repository');

class Repository {
  constructor(knex, model) {
    this.knex = knex;
    this.Model = model;
  }

  async get(params) {
    debug('%s get(%s) request', this.Model.modelName);
    const model = await this.knex(this.Model.modelName)
      .where(params);

    debug('get(%j) response %j', params, model);
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
    debug('%s update(%s) request %j', this.Model.modelName, id);
    const model = { id, ...body };
    await this.knex(this.Model.modelName)
      .where({ id })
      .update(this.Model.toUpdateJson({ id, ...body }));

    debug('update() response %j', model);
    return model;
  }

  async list({
    filters, page = 1, perPage, orderBy, leftOuterJoin, innerJoins,
  }) {
    debug('%s list with filters %j page %d perPage %d request', this.Model.modelName, filters, page, perPage);
    const query = this.knex(this.Model.modelName)
      .where(filters);

    if (orderBy) {
      if (typeof orderBy === 'string') {
        query.orderBy(orderBy);
      } else {
        query.orderBy(...orderBy);
      }
    } else {
      query.orderBy('created_at');
    }

    if (innerJoins) {
      query.options({ nestTables: true });
      innerJoins.forEach(({ table, join }) => {
        query.innerJoin(table, join);
      });
    }

    if (leftOuterJoin) {
      query
        .options({ nestTables: true })
        .leftOuterJoin(leftOuterJoin.table, leftOuterJoin.join);
    }

    if (perPage) {
      query
        .offset((page - 1) * perPage)
        .limit(perPage);
    }
    return query;
  }
}

module.exports = Repository;
