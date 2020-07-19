const players = require('./players');
const leagues = require('./leagues');
const matches = require('./matches');
const elos = require('./elos');
const auth = require('./auth');

module.exports = {
  '/players': players,
  '/matches': matches,
  '/leagues': leagues,
  '/elos': elos,
  '/auth': auth,
};
