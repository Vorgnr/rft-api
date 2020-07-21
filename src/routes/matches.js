const router = require('express').Router();
const {
  errorHander, mustBeAuth, mustOwnMatch, mustBeAdmin,
} = require('../utils/response');

const matches = (controllers) => {
  router.post('/', async (req, res, next) => {
    try {
      mustBeAuth(req);
      const match = await controllers.MatchController.create(req.body);
      res.json(match);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.get('/:matchId', async (req, res, next) => {
    try {
      const match = await controllers.MatchController.get(req.params.matchId);
      res.json(match);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.put('/:matchId', async (req, res, next) => {
    try {
      mustOwnMatch(req);
      const match = await controllers.MatchController.update(req.params.matchId, req.body);
      res.json(match);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.put('/:matchId/moderate', async (req, res, next) => {
    try {
      mustBeAdmin(req);
      const match = await controllers.MatchController.moderate(req.params.matchId);
      res.json(match);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.get('/', async (req, res, next) => {
    try {
      const {
        page, perPage, leagueId, name, matchId, orderBy,
      } = req.query;

      const filters = {
        is_active: true,
      };
      if (leagueId) filters.league_id = leagueId;
      if (name) filters.name = name;
      if (matchId) filters.matchId = matchId;
      const results = await controllers.MatchController.list({
        page, perPage, filters, orderBy,
      });
      res.json(results);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  return router;
};

module.exports = matches;
