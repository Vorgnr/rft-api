const router = require('express').Router();
const { errorHander, mustBeAuth, mustOwnPlayer } = require('../utils/response');
const { omit } = require('../utils/object');

const players = (controllers) => {
  router.post('/', async (req, res) => {
    try {
      const player = await controllers.PlayerController.create(req.body);
      res.json(player);
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.get('/:playerId', async (req, res) => {
    try {
      const player = await controllers.PlayerController.get(req.params.playerId);
      res.json(player);
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.put('/:playerId', async (req, res) => {
    try {
      mustBeAuth(req);
      mustOwnPlayer(req);
      if (!req.session.player.is_admim) {
        req.body = omit(['is_admin'], req.body);
      }
      const player = await controllers.PlayerController.update(req.params.playerId, req.body);
      res.json(player);
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.get('/', async (req, res) => {
    try {
      const {
        page, perPage, name, leagueId, orderBy, withElo,
      } = req.query;

      const filters = {};
      if (name) filters.name = name;
      if (leagueId) filters.league_id = leagueId;
      const results = await controllers.PlayerController.list({
        page, perPage, filters, orderBy, withElo,
      });
      res.json(results);
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.post('/recover-password-request', async (req, res) => {
    try {
      const results = await controllers.PlayerController.recoverPasswordRequest(req.body);
      res.json(results);
    } catch (error) {
      errorHander(error, res);
    }
  });

  router.post('/recover-password', async (req, res) => {
    try {
      const results = await controllers.PlayerController.recoverPassword(req.body);
      res.json(results);
    } catch (error) {
      errorHander(error, res);
    }
  });

  return router;
};

module.exports = players;
