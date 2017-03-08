// @flow

import type { Server } from 'restify';
import type { Models } from 'flowTypes';

import searchFactory from 'api/controllers/search';

export default function searchResource (server: Server, models: Models) {
  const controller = searchFactory(models);

  server.get('/search', (req, res, next) =>
    controller
      .search(req.params.filter)
      .then((results) => {
        if (results) {
          res.send(200, results);
        } else {
          res.send(404);
        }

        return next();
      }, (error) => {
        res.send(500, error);
        return next();
      }));
}
