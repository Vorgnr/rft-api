const { v4: uuidv4 } = require('uuid');
const { pick } = require('../utils/object')
class BaseModel {
  constructor(body = {}) {
    Object.assign(this, pick(body, this.constructor.schema))
    this._id = body.id || uuidv4();
  }

  get id() {
    return this._id;
  }

  toJson() {
    const ob = pick(this, this.constructor.schema);
    return { id: this.id, ...ob } 
  }
}

module.exports = BaseModel;
