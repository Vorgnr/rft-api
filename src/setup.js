const debug = require('debug');
const knex = require('knex');

const Repository = require('./repository');
const Player = require('./models/player');
const League = require('./models/league');
const Match = require('./models/match');
const PlayerController = require('./controllers/player-controller');
const LeagueController = require('./controllers/league-controller');
const MatchController = require('./controllers/match-controller');

const dblog = debug('rft:database');

const getKnex = async (config) => {
  const dbInstance = knex({
    client: 'mysql',
    connection: config,
  });

  return dbInstance
    .raw('select 1+1 as result')
    .then(() => {
      dblog('Mysql started');
      return dbInstance;
    })
    .catch((err) => {
      dblog('Mysql error %j', err);
      process.exit(1);
    });
};

const setup = async (config) => {
  const dbInstance = await getKnex(config);
  const playerRepo = new Repository(dbInstance, Player);
  const leagueRepo = new Repository(dbInstance, League);
  const matchRepo = new Repository(dbInstance, Match);

  return {
    Controllers: {
      PlayerController: new PlayerController({ repository: playerRepo, model: Player }),
      LeagueController: new LeagueController({ repository: leagueRepo, model: League }),
      MatchController: new MatchController({ repository: matchRepo, model: Match }),
    },
    knex: dbInstance,
  };
};

module.exports = setup;
