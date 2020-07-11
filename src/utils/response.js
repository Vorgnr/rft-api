const debug = require('debug')('rft:response');
const { HttpError } = require('../static/errors');

const errorHander = (error, res) => {
  debug('Error %e', error);
  if (error instanceof HttpError) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.send({ error: error.message });
};

module.exports = { errorHander };
