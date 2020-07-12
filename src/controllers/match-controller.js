const BaseController = require('./base-controller');
const Match = require('../models/match');

class MatchController extends BaseController {
  async update(id, body) {
    const matchBefore = await this.get(id);
    const match = new Match(matchBefore);
    if (!matchBefore.completed_at && match.completed_at) {
      // const league = await this.controllers.LeagueController.get(match.league_id);
      // const elo = await this.controllers.EloController.
    }
    return this.repository.update(id, body);
  }
}

module.exports = MatchController;
