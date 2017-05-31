// @flow

import type { Server } from 'restify';
import type { Models } from 'flowTypes';

import config from 'config';
import _ from 'lodash';
import controllerFactory from 'api/controllers/guild';

export default function guildsResource (server: Server, models: Models) {
  const controller = controllerFactory(models);

  const routeMap = {
    'guilds/:name': controller.read,
    'guilds/:name/members': controller.readUsers,
    'guilds/:name/characters': controller.readCharacters,
    'guilds/:name/logs': controller.logs,
    'guilds/:name/ranks': controller.ranks,
    'guilds/:name/stash': controller.stash,
    'guilds/:name/treasury': controller.treasury,
    'guilds/:name/teams': controller.teams,
    'guilds/:name/upgrades': controller.upgrades,
  };

  _.forEach(routeMap, (func, routeName) => {
    server.get(routeName, async (req, res, next) => {
      try {
        const params = {
          limit: _.toInteger(req.params.limit) || config.pagination.guilds,
          offset: _.toInteger(req.params.offset) || 0,
        };

        const data = await func(req.params.name, { email: req.username, ...params });
        if (data) {
          res.send(200, data);
        } else {
          res.send(404);
        }
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

  server.get('of-the-day/guilds', async (req, res, next) => {
    try {
      const guilds = await controller.guildsOfTheDay();
      res.send(200, guilds);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });

  server.put('/guilds/:name/privacy', async (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    try {
      await controller.setPublic(req.params.name, req.username, req.params.privacy);
      res.send(200);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });

  server.del('/guilds/:name/:privacy', async (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    try {
      await controller.removePublic(req.params.name, req.username, req.params.privacy);
      res.send(200);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });
}
