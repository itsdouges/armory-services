const searchFactory = require('../../controllers/search');

module.exports = function searchResource (server, models) {
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
};
