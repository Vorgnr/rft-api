const router = require('express').Router();
const { errorHander } = require('../utils/response');

const auth = (controllers) => {
  router.post('/signin', async (req, res) => {
    try {
      const player = await controllers.PlayerController.authenticate(req.body);
      req.session.player = player;
      res.json(player);
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.post('/signout', async (req, res) => {
    try {
      req.session.destroy();
      res.json({ message: 'signout' });
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.get('/', async (req, res) => {
    try {
      res.json(req.session.player || null);
    } catch (error) {
      errorHander(error, res);
    }
  });

  return router;
};

module.exports = auth;
