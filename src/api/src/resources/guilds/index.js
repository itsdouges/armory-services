const controllerFactory = require('../../controllers/guild');

function guildsResource (server, models) {
  const controller = controllerFactory(models);

  server.get('guilds/:name', (req, res, next) => {
    controller
      .read(req.params.name)
      .then((guild) => {
        if (guild) {
          res.send(200, guild);
        } else {
          res.send(404);
        }

        return next();
      }, (error) => {
        res.send(500, error);
        return next();
      });
  });

  server.get('random/guilds/:n', (req, res, next) => {
    controller
      .random(req.params.n)
      .then((guilds) => {
        res.send(guilds);
        return next();
      }, (error) => {
        res.send(500, error);
        return next();
      });
  });
}

module.exports = guildsResource;
