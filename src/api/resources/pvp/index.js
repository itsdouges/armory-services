var RESOURCES = Object.freeze({
  stats: '/users/:alias/pvp/stats',
  games: '/users/:alias/pvp/games',
  standings: '/users/:alias/pvp/standings'
});

function PvpResource (server, controller) {
  server.get(RESOURCES.stats, function (req, res, next) {
    controller
      .stats(req.params.alias)
      .then(function (stats) {
        res.send(200, stats);

        return next();
      }, function (error) {
        console.log(error);
        res.send(404);
        return next();
      });
  });

  server.get(RESOURCES.games, function (req, res, next) {
    controller
      .games(req.params.alias)
      .then(function (games) {
        res.send(200, games);
        return next();
      }, function (error) {
        console.error(error);
        res.send(404);
        return next();
      });
  });

  server.get(RESOURCES.standings, function (req, res, next) {
    controller
      .standings(req.params.alias)
      .then(function (standings) {
        res.send(200, standings);
        return next();
      }, function (error) {
        console.error(error);
        res.send(404);
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
