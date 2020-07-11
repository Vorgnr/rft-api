const router = require('express').Router();
const { HttpError } = require('../static/errors');

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
      if (error instanceof HttpError) {
        res.status(error.status).send({ error: error.message });
      }
    }
    next();
  });

  router.put('/:playerId', async (req, res, next) => {
    try {
      const player = await controllers.PlayerController.update(req.params.playerId, req.body);
      res.json(player);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.status).send({ error: error.message });
      }
    }
    next();
  });

  return router;
};

module.exports = players;
