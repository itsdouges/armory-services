// @flow

import type { Server } from 'restify';

import _ from 'lodash';
import memoize from 'memoizee';
import config from 'config';

export default function PvpResource (server: Server, controller: any) {
  // server.get('/users/:alias/pvp/stats', (req, res, next) => {
  //   controller
  //     .stats(req.params.alias)
  //     .then((stats) => {
  //       res.send(200, stats);

  //       return next();
  //     }, (error) => {
  //       console.log(error);
  //       res.send(404);
  //       return next();
  //     });
  // });

  // server.get('/users/:alias/pvp/games', (req, res, next) => {
  //   controller
  //     .games(req.params.alias)
  //     .then((games) => {
  //       res.send(200, games);
  //       return next();
  //     }, (error) => {
  //       console.error(error);
  //       res.send(404);
  //       return next();
  //     });
  // });

  // server.get('/users/:alias/pvp/standings', (req, res, next) => {
  //   controller
  //     .standings(req.params.alias)
  //     .then((standings) => {
  //       res.send(200, standings);
  //       return next();
  //     }, (error) => {
  //       console.error(error);
  //       res.send(404);
  //       return next();
  //     });
  // });

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
