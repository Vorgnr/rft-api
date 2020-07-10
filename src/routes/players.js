const router = require('express').Router();

const players = (controllers) => {
  router.post('/', async (req, res, next) => {
    const player = await controllers.PlayerController.create(req.body);
    res.json(player);
    next();
  });

  return router;
};

module.exports = players;
