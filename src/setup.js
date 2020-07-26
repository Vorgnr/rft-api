const debug = require('debug');
const knex = require('knex');

const Repository = require('./repository');
const Player = require('./models/player');
const League = require('./models/league');
const Match = require('./models/match');
const Elo = require('./models/elo');
const PlayerController = require('./controllers/player-controller');
const LeagueController = require('./controllers/league-controller');
const MatchController = require('./controllers/match-controller');
const EloController = require('./controllers/elo-controller');

const dblog = debug('rft:database');

const getKnex = async (config) => {
  dblog('Mysql config %s@%s', config.user, config.host);
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
  const eloRepo = new Repository(dbInstance, Elo);

  const playerController = new PlayerController({ repository: playerRepo, model: Player });
  const leagueController = new LeagueController({ repository: leagueRepo, model: League });
  const eloController = new EloController({ repository: eloRepo, model: Elo });

  return {
    Controllers: {
      PlayerController: playerController,
      LeagueController: leagueController,
      EloController: eloController,
      MatchController: new MatchController({
        repository: matchRepo,
        model: Match,
        controllers: {
          EloController: eloController,
          LeagueController: leagueController,
        },
      }),
    },
    knex: dbInstance,
  };
};

module.exports = setup;
