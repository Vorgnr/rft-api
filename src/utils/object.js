function pick(object, keys) {
  return keys.reduce((acc, key) => {
    const obj = acc;
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
}

function omit(keys, obj) {
  if (!keys.length) return obj;
  const { [keys.pop()]: omitted, ...rest } = obj;
  return omit(keys, rest);
}

module.exports = {
  pick, omit,
};
