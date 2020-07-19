const router = require('express').Router();
const { errorHander } = require('../utils/response');

const auth = (controllers) => {
  router.post('/signin', async (req, res, next) => {
    try {
      const player = await controllers.PlayerController.authenticate(req.body);
      req.session.player = player;
      res.json(player);
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.post('/signout', async (req, res, next) => {
    try {
      req.session.destroy();
      res.json({ message: 'signout' });
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  router.get('/', async (req, res, next) => {
    try {
      res.json(req.session.player || {});
    } catch (error) {
      errorHander(error, res);
    }
    next();
  });

  return router;
};

module.exports = auth;
