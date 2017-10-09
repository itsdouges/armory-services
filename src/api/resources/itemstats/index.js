// @flow

import type { Server } from 'restify';

import * as controller from 'api/controllers/itemstats';

export default function ItemStatsResource (server: Server) {
  server.get('/itemstats/:id', async (req, res, next) => {
    try {
      const itemStats = await controller.read(+req.params.id, {
        type: req.params.type,
        rarity: req.params.rarity,
        level: +req.params.level,
      }, req.params.lang);

      res.send(200, itemStats);
    } catch (err) {
      res.send(500, {
        error: err.message,
      });
    }

    return next();
  });

  /**
   * Request Body Example:
   *
[
  {
    "id": 1379,
    "level": 80,
    "type": "Coat",
    "rarity": "Ascended",
  }
]
   */
  server.post('/itemstats', async (req, res, next) => {
    try {
      const requests = req.params
        .map((stat) => ({
          id: stat.id,
          type: stat.type,
          rarity: stat.rarity,
          level: +stat.level,
        }));

      const response = await controller.bulkRead(requests, req.params.lang);

      res.send(200, response);
    } catch (err) {
      res.send(500, {
        error: err.message,
      });
    }

    return next();
  });
}
