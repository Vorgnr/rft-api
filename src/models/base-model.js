const { v4: uuidv4 } = require('uuid');
const { pick } = require('../utils/object');

class BaseModel {
  constructor(body = {}) {
    Object.assign(this, pick(body, this.constructor.schema));
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  static get internalKeys() {
    return ['id', 'created_at'];
  }

  static get schema() {
    return [];
  }

  static get readSchema() {
    return [];
  }

  static get updateSchema() {
    return this.schema
      .filter((k) => this.internalKeys.indexOf(k) === -1);
  }

  static toUpdateJson(instance) {
    return pick(instance, this.updateSchema);
  }

  toJson() {
    return pick(this, this.constructor.schema);
  }
}

module.exports = BaseModel;
