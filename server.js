const express = require('express');
const debug = require('debug')('server');
const dotenv = require('dotenv');

const config = require('./config');
const setup = require('./src/setup');
const routes = require('./src/routes');

dotenv.config();

const port = process.env.PORT;
const env = process.env.NODE_ENV;

module.exports = {
  start: async () => {
    debug('Server preparing %s using port %d...', env, port);
    const Controllers = await setup(config.database[env]);
    debug('%d Controllers ok ...', Object.keys(Controllers).length);
    const app = express();

    Object.keys(routes).forEach((path) => {
      const handler = routes[path];
      app.use(path, handler(Controllers));
    });

    return new Promise((resolve) => {
      app.listen(port, () => {
        debug('RFT Api listening port %d', port);
        resolve();
      });
    });
  },
};
