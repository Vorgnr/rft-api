const router = require('express').Router();
const { HttpError } = require('../static/errors');

const leagues = (controllers) => {
  router.post('/', async (req, res, next) => {
    const league = await controllers.LeagueController.create(req.body);
    res.json(league);
    next();
  });

  router.get('/:leagueId', async (req, res, next) => {
    try {
      const league = await controllers.LeagueController.get(req.params.leagueId);
      res.json(league);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.status).send({ error: error.message });
      }
    }
    next();
  });

  router.put('/:leagueId', async (req, res, next) => {
    try {
      const league = await controllers.LeagueController.update(req.params.leagueId, req.body);
      res.json(league);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.status).send({ error: error.message });
      }
    }
    next();
  });

  return router;
};

module.exports = leagues;
