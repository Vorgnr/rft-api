const router = require('express').Router();
const { errorHander } = require('../utils/response');

const players = (controllers) => {
  router.post('/', async (req, res, next) => {
    try {
      const player = await controllers.PlayerController.create(req.body);
      res.json(player);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.get('/:playerId', async (req, res, next) => {
    try {
      const player = await controllers.PlayerController.get(req.params.playerId);
      res.json(player);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.put('/:playerId', async (req, res, next) => {
    try {
      const player = await controllers.PlayerController.update(req.params.playerId, req.body);
      res.json(player);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.get('/', async (req, res, next) => {
    try {
      const {
        page, perPage, name, leagueId, orderBy, withElo,
      } = req.query;

      const filters = {};
      if (name) filters.name = name;
      if (leagueId) filters.league_id = leagueId;
      const results = await controllers.PlayerController.list({
        page, perPage, filters, orderBy, withElo,
      });
      res.json(results);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  return router;
};

module.exports = players;
