const express = require('express');
const debug = require('debug')('rft:server');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const config = require('./config');
const setup = require('./src/setup');
const routes = require('./src/routes');

let app = express();

dotenv.config();

const port = process.env.PORT;
const env = process.env.NODE_ENV;

module.exports = {
  start: async () => {
    debug('Server preparing %s using port %d...', env, port);
    const { knex, Controllers } = await setup(config.database[env]);
    debug('%d Controllers ok ...', Object.keys(Controllers).length);

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    Object.keys(routes).forEach((path) => {
      const handler = routes[path];
      app.use(path, handler(Controllers));
    });

    return new Promise((resolve) => {
      app = app.listen(port, () => {
        debug('RFT Api listening port %d', port);
        resolve(knex);
      });
    });
  },

  stop() {
    debug('Server manual close');
    app.close();
    process.exit(0);
  },
};
