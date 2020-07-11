function pick(object, keys) {
  return keys.reduce((acc, key) => {
    const obj = acc;
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
}

module.exports = {
  pick,
};
