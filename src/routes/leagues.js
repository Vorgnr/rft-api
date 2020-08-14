const router = require('express').Router();
const { errorHander, mustBeAdmin } = require('../utils/response');

const leagues = (controllers) => {
  router.post('/', async (req, res) => {
    try {
      mustBeAdmin(req);
      const league = await controllers.LeagueController.create(req.body);
      res.json(league);
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.get('/:leagueId', async (req, res) => {
    try {
      const league = await controllers.LeagueController.get(req.params.leagueId);
      res.json(league);
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.put('/:leagueId', async (req, res) => {
    try {
      mustBeAdmin(req);
      const league = await controllers.LeagueController.update(req.params.leagueId, req.body);
      res.json(league);
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.get('/', async (req, res) => {
    try {
      const {
        page, perPage, name, orderBy, showAll,
      } = req.query;

      const filters = {};
      if (!showAll) {
        filters.is_active = true;
      }
      if (name) filters.name = name;
      let cleanOrderBy;
      if (orderBy) {
        cleanOrderBy = orderBy;
      } else {
        cleanOrderBy = [
          { column: 'is_active', order: 'desc' },
          { column: 'created_at', order: 'desc' },
        ];
      }
      const results = await controllers.LeagueController.list({
        page, perPage, filters, orderBy: cleanOrderBy,
      });
      res.json(results);
    } catch (error) {
      errorHander(error, res);
    }
  });

  return router;
};

module.exports = leagues;
