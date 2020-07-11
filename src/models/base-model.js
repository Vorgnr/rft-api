const { v4: uuidv4 } = require('uuid');
const { pick } = require('../utils/object');

class BaseModel {
  static get schema() {
    return [];
  }

  static get readSchema() {
    return [];
  }

  constructor(body = {}) {
    Object.assign(this, pick(body, this.constructor.schema));
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  toJson() {
    return pick(this, this.constructor.schema);
  }
}

module.exports = BaseModel;
