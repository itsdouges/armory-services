import memoize from 'memoizee';
import config from 'config';

function PvpResource (server, controller) {
  server.get('/users/:alias/pvp/stats', (req, res, next) => {
    controller
      .stats(req.params.alias)
      .then((stats) => {
        res.send(200, stats);

        return next();
      }, (error) => {
        console.log(error);
        res.send(404);
        return next();
      });
  });

  server.get('/users/:alias/pvp/games', (req, res, next) => {
    controller
      .games(req.params.alias)
      .then((games) => {
        res.send(200, games);
        return next();
      }, (error) => {
        console.error(error);
        res.send(404);
        return next();
      });
  });

  server.get('/users/:alias/pvp/standings', (req, res, next) => {
    controller
      .standings(req.params.alias)
      .then((standings) => {
        res.send(200, standings);
        return next();
      }, (error) => {
        console.error(error);
        res.send(404);
        return next();
      });
  });

  const memoizedLeaderboard = memoize(controller.leaderboard, {
    maxAge: config.leaderboards.getCacheTtl,
    promise: true,
    preFetch: true,
  });

  server.get('/leaderboards/pvp/:region', (req, res, next) => {
    memoizedLeaderboard(req.params.region)
      .then((leaderboard) => {
        res.send(200, leaderboard);
        return next();
      }, (error) => {
        console.error(error);
        res.send(500);
        return next();
      });
  });

  server.get('/users/:alias/achievements', (req, res, next) => {
    controller
      .achievements(req.params.alias)
      .then((standings) => {
        res.send(200, standings);
        return next();
      }, (error) => {
        console.error(error);
        res.send(404);
        return next();
      });
  });
}

module.exports = PvpResource;
