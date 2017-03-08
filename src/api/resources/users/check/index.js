// @flow

import type { Server } from 'restify';

export default function CheckResource (server: Server, controller: any) {
  server.get('/users/check/gw2-token/:token', (req, res, next) => {
    controller.gw2Token({
      token: req.params.token,
    })
    .then((data) => {
      res.send(200, data);
      return next();
    }, (e) => {
      res.send(400, e);
      return next();
    });
  });

  server.get('/users/check/email/:email', (req, res, next) => {
    controller
      .email({
        email: req.params.email.toLowerCase(),
      })
      .then(() => {
        res.send(200);
        return next();
      }, (e) => {
        res.send(400, e);
        return next();
      });
  });

  server.get('/users/check/alias/:alias', (req, res, next) => {
    controller
      .alias({
        alias: req.params.alias,
      })
      .then(() => {
        res.send(200);
        return next();
      }, (e) => {
        res.send(400, e);
        return next();
      });
  });
}
