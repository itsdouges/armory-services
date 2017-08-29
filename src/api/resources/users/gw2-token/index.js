// @flow

import type { Server } from 'restify';

import errors from 'restify-errors';

export default function tokenResourceFactory (server: Server, controller: any) {
  server.get('/users/me/gw2-tokens', (req, res, next) => {
    if (!req.username) {
      return next(new errors.UnauthorizedError());
    }

    return controller
      .list(req.username)
      .then((tokens) => {
        res.send(200, tokens);
        return next();
      }, (err) => {
        res.send(500, err);
        return next();
      });
  });

  server.post('/users/me/gw2-tokens', (req, res, next) => {
    if (!req.username) {
      return next(new errors.UnauthorizedError());
    }

    return controller
      .add(req.username, req.params.token)
      .then((data) => {
        res.send(200, data);
        return next();
      }, (e) => {
        res.send(400, e);
        return next();
      });
  });

  server.del('/users/me/gw2-tokens/:token', (req, res, next) => {
    if (!req.username) {
      return next(new errors.UnauthorizedError());
    }

    return controller
      .remove(req.username, req.params.token)
      .then(() => {
        res.send(200);
        return next();
      }, (err) => {
        res.send(500, err);
        return next();
      });
  });

  server.put('/users/me/gw2-tokens/:token/set-primary', (req, res, next) => {
    if (!req.username) {
      return next(new errors.UnauthorizedError());
    }

    return controller
      .selectPrimary(req.username, req.params.token)
      .then(() => {
        res.send(200);
        return next();
      }, (err) => {
        res.send(500, err);
        return next();
      });
  });
}
