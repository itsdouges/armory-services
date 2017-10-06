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

      const itemStats = await readItemStats(req.params.id);
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
}
