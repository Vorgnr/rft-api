const players = require('./players');
const leagues = require('./leagues');
const matches = require('./matches');

module.exports = {
  '/players': players,
  '/matches': matches,
  '/leagues': leagues,
};
