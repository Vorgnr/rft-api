const router = require('express').Router();
const { HttpError } = require('../static/errors');

const matches = (controllers) => {
  router.post('/', async (req, res, next) => {
    const match = await controllers.MatchController.create(req.body);
    res.json(match);
    next();
  });

  router.get('/:matchId', async (req, res, next) => {
    try {
      const match = await controllers.MatchController.get(req.params.matchId);
      res.json(match);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.status).send({ error: error.message });
      }
    }
    next();
  });

  router.put('/:matchId', async (req, res, next) => {
    try {
      const match = await controllers.MatchController.update(req.params.matchId, req.body);
      res.json(match);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.status).send({ error: error.message });
      }
    }
    next();
  });

  return router;
};

module.exports = matches;
