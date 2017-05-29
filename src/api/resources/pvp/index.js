// @flow

import type { Server } from 'restify';

import _ from 'lodash';
import memoize from 'memoizee';
import config from 'config';

export default function PvpResource (server: Server, controller: any) {
  const memoizedLeaderboard = memoize(controller.leaderboard, {
    maxAge: config.leaderboards.getCacheTtl,
    promise: true,
    preFetch: true,
  });

  server.get('/leaderboards/pvp/:region', async (req, res, next) => {
    try {
      const leaderboard = await memoizedLeaderboard(req.params.region, {
        limit: _.toInteger(req.params.limit) || config.pagination.leaderboards,
        offset: _.toInteger(req.params.offset) || 0,
      });

      res.send(200, leaderboard);
    } catch (e) {
      res.send(500);
      console.error(e);
    }

    return next();
  });
}
