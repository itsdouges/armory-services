// @flow

import type { Server } from 'restify';
import type { Models } from 'flowTypes';

import _ from 'lodash';
import controllerFactory from 'api/controllers/guild';

export default function guildsResource (server: Server, models: Models) {
  const controller = controllerFactory(models);

  const routeMap = {
    'guilds/:name': controller.read,
    'guilds/:name/logs': controller.logs,
    'guilds/:name/members': controller.members,
    'guilds/:name/ranks': controller.ranks,
    'guilds/:name/stash': controller.stash,
    'guilds/:name/treasury': controller.treasury,
    'guilds/:name/teams': controller.teams,
    'guilds/:name/upgrades': controller.upgrades,
  };

  _.forEach(routeMap, (func, routeName) => {
    server.get(routeName, async (req, res, next) => {
      try {
        const data = await func(req.params.name, { email: req.username });

        data
          ? res.send(200, data)
          : res.send(404);
      } catch (e) {
        res.send(500, e);
      }

      return next();
    });
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
