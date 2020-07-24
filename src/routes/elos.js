const router = require('express').Router();
const { errorHander } = require('../utils/response');

const eloRoutes = (controllers) => {
  router.get('/', async (req, res) => {
    try {
      const {
        page, perPage, playerId, leagueId, orderBy,
      } = req.query;

      const filters = {};
      if (playerId) filters.player_id = playerId;
      if (leagueId) filters.league_id = leagueId;
      const elos = await controllers.EloController.list({
        page, perPage, filters, orderBy,
      });
      res.json(elos);
    } catch (error) {
      errorHander(error, res);
    }
  });

  return router;
};

module.exports = eloRoutes;
