const router = require('express').Router();
const { errorHander } = require('../utils/response');

const matches = (controllers) => {
  router.post('/', async (req, res, next) => {
    try {
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
      const match = await controllers.MatchController.update(req.params.matchId, req.body);
      res.json(match);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  return router;
};

module.exports = matches;
