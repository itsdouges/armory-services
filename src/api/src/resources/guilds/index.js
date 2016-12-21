import controllerFactory from '../../controllers/guild';

function guildsResource (server, models) {
  const controller = controllerFactory(models);

  server.get('guilds/:name', async (req, res, next) => {
    try {
      const guild = await controller.read(req.params.name, { email: req.username });

      guild
        ? res.send(200, guild)
        : res.send(404);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });

  server.get('guilds/:name/logs', async (req, res, next) => {
    try {
      const logs = await controller.logs(req.params.name, { email: req.username });

      logs
        ? res.send(200, logs)
        : res.send(404);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });

  server.get('guilds/:name/members', async (req, res, next) => {
    try {
      const members = await controller.members(req.params.name, { email: req.username });

      members
        ? res.send(200, members)
        : res.send(404);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });

  server.get('random/guilds/:n', async (req, res, next) => {
    try {
      const guilds = await controller.random(req.params.n);
      res.send(200, guilds);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });
}

module.exports = guildsResource;
