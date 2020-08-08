const { NotFoundError } = require('../static/errors');
const { pick } = require('../utils/object');

class BaseController {
  constructor({ repository, model, controllers = {} }) {
    this.repository = repository;
    this.Model = model;
    this.controllers = controllers;
  }

  async get(id) {
    const entity = await this.repository.get({ id });
    if (!entity) {
      throw new NotFoundError(`${this.Model.modelName} not found`);
    }
    return entity.toJson();
  }

  async update(id, payload) {
    const entity = await this.get(id);
    const changedKeys = Object.keys(payload).filter((k) => entity[k] !== payload[k]);
    if (!changedKeys.length) {
      return entity;
    }
    const body = pick(payload, changedKeys);
    return this.repository.update(id, body);
  }

  async create(body) {
    const entity = await this.repository.create(body);
    return entity.toJson();
  }

  async list({
    filters, page, perPage, orderBy, leftOuterJoin,
  }) {
    return this.repository.list({
      filters, page, perPage, orderBy, leftOuterJoin,
    });
  }
}

module.exports = BaseController;
