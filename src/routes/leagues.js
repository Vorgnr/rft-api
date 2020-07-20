const router = require('express').Router();
const { errorHander, mustBeAuth, mustBeAdmin } = require('../utils/response');

const leagues = (controllers) => {
  router.post('/', async (req, res, next) => {
    try {
      mustBeAuth(req);
      mustBeAdmin(req);
      const league = await controllers.LeagueController.create(req.body);
      res.json(league);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.get('/:leagueId', async (req, res, next) => {
    try {
      const league = await controllers.LeagueController.get(req.params.leagueId);
      res.json(league);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.put('/:leagueId', async (req, res, next) => {
    try {
      mustBeAuth(req);
      mustBeAdmin(req);
      const league = await controllers.LeagueController.update(req.params.leagueId, req.body);
      res.json(league);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.get('/', async (req, res, next) => {
    try {
      const {
        page, perPage, name, orderBy,
      } = req.query;

      const filters = {
        is_active: true,
      };
      if (name) filters.name = name;
      const results = await controllers.LeagueController.list({
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

module.exports = leagues;
