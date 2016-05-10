var RESOURCES = Object.freeze({
  stats: '/users/:alias/pvp/stats',
  games: '/users/:alias/pvp/games',
  standings: '/users/:alias/pvp/standings'
});

function PvpResource(server, controller) {
  server.get(RESOURCES.stats, function (req, res, next) {
    controller
      .stats(req.params.alias)
      .then(function (stats) {
        res.send(200, stats);

        return next();
      }, function (error) {
        res.send(404, error);
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
        res.send(404, error);
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
        res.send(404, error);
        return next();
      });
  });
}

module.exports = PvpResource;
