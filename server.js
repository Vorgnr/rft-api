const express = require('express');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const debug = require('debug')('rft:server');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const config = require('./config');
const setup = require('./src/setup');
const routes = require('./src/routes');

dotenv.config();

const port = process.env.PORT;
const env = process.env.NODE_ENV;
const frontApp = process.env.FRONT_APP;

const sessionSecret = process.env.SESSION_SECRET;
const sessionMaxAge = process.env.SESSION_MAXAGE;
let app = express();

module.exports = {
  start: async (args = {}) => {
    debug('Server preparing %s using port %d...', env, port);
    const { knex, Controllers } = await setup(config.database[env]);
    const store = new KnexSessionStore({ knex });
    debug('%d Controllers ok ...', Object.keys(Controllers).length);

    app.use(cors({
      credentials: true,
      origin: frontApp,
    }));

    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', frontApp);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      res.setHeader('Access-Control-Allow-Credentials', true);
      next();
    });

    app.use(helmet());
    app.set('trust proxy', 1);
    app.use(session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true,
      cookie: {
        name: 'rftapisid',
        maxAge: Number(sessionMaxAge),
      },
      secure: false,
      store,
    }));

    if (args.isTest) {
      app.use((req, res, next) => {
        req.session.player = {
          is_admin: true,
        };
        next();
      });
    }

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    app.use((req, res, next) => {
      let message;
      if (!req.session.player) {
        message = 'Unauthenticated';
      } else {
        message = `Authenticated ${req.session.player.is_admin ? 'Admin' : ''}`;
      }
      debug('%s request %s', message, req.originalUrl);
      next();
    });

    Object.keys(routes).forEach((path) => {
      const handler = routes[path];
      app.use(path, handler(Controllers));
    });

    app.use((err, req, res, next) => {
      debug('Internal server error %j', err);
      res.status(500).send('Internal server error');
      next();
    });

    if (args.noListen) {
      return app;
    }
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
