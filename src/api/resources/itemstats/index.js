// @flow

import type { Server } from 'restify';

import calculateAttributes from 'lib/gw2/itemstats';
import { readItemStats } from 'lib/gw2';

export default function ItemStatsResource (server: Server) {
  server.get('/itemstats/:id', async (req, res, next) => {
    try {
      const item = {
        type: req.params.type,
        rarity: req.params.rarity,
        level: +req.params.level,
      };

      const itemStats = await readItemStats(req.params.id, req.params.lang);
      const attributes = calculateAttributes(item, itemStats);

      res.send(200, {
        ...itemStats,
        attributes,
      });
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

      const promises = requests.map((request) => readItemStats(request.id, req.params.lang));

      const itemStats = await Promise.all(promises);

      const response = requests.map((request, index) => {
        const itemStat = itemStats[index];
        const attributes = calculateAttributes(request, itemStat);

        return {
          ...itemStat,
          attributes,
        };
      });

      res.send(200, response);
    } catch (err) {
      res.send(500, {
        error: err.message,
      });
    }

    return next();
  });
}
