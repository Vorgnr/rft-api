const router = require('express').Router();
const { errorHander } = require('../utils/response');

const players = (controllers) => {
  router.post('/', async (req, res, next) => {
    const player = await controllers.PlayerController.create(req.body);
    res.json(player);
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

  return router;
};

module.exports = players;
