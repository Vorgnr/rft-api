const debug = require('debug')('rft:response');
const { HttpError, UnauthorizedError, ForbiddenError } = require('../static/errors');

const errorHander = (error, res) => {
  debug('Error %e', error);
  if (error instanceof HttpError) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.send({ error: error.message });
};

const mustBeAuth = (req) => {
  if (!req.session.player) {
    throw new UnauthorizedError('Must be auth');
  }
};

const mustBeAdmin = (req) => {
  if (!req.session.player || !req.session.player.is_admin) {
    throw new UnauthorizedError('Must be admin');
  }
};

const mustOwnPlayer = (req) => {
  if (!req.session.player.is_admin
    && req.params.playerId !== req.session.player.id) {
    throw new ForbiddenError('Forbidden acces');
  }
};

const mustOwnMatch = (req) => {
  mustBeAuth(req);
  if (!req.session.player.is_admin
      && [req.body.player1_id, req.body.player2_id].indexOf(req.session.player.id) === -1) {
    throw new ForbiddenError('Forbidden acces');
  }
};

module.exports = {
  errorHander,
  mustBeAuth,
  mustOwnMatch,
  mustBeAdmin,
  mustOwnPlayer,
};
