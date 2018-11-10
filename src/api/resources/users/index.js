// @flow

import type { Server } from 'restify';

import { UnauthorizedError } from 'restify-errors';
import _ from 'lodash';

export default function UserResource(server: Server, controller: any) {
  server.get('/users/me', (req, res, next) => {
    if (!req.username) {
      return next(new UnauthorizedError());
    }

    return controller.read({ email: req.username, excludeChildren: true }).then(
      data => {
        res.send(200, data);
        return next();
      },
      err => {
        console.error(err);
        res.send(500);
        return next();
      }
    );
  });

  server.get('/users/:alias', (req, res, next) => {
    return controller
      .read({
        alias: req.params.alias,
        email: req.username,
      })
      .then(
        data => {
          res.send(200, data);
          return next();
        },
        err => {
          console.error(err);
          res.send(404);
          return next();
        }
      );
  });

  server.put('/users/me/password', (req, res, next) => {
    if (!req.username) {
      return next(new UnauthorizedError());
    }

    return controller
      .updatePassword({
        email: req.username,
        password: req.params.password,
        currentPassword: req.params.currentPassword,
      })
      .then(
        () => {
          res.send(200);
          return next();
        },
        e => {
          res.send(400, e);
          return next();
        }
      );
  });

  server.post('/users', (req, res, next) => {
    controller
      .create({
        alias: req.params.alias,
        email: req.params.email.toLowerCase(),
        password: req.params.password,
      })
      .then(
        () => {
          res.send(200);
          return next();
        },
        e => {
          res.send(400, e);
          return next();
        }
      );
  });

  server.post('claim/user', async (req, res, next) => {
    try {
      await controller.claim({
        alias: req.params.alias,
        email: req.params.email.toLowerCase(),
        password: req.params.password,
        apiToken: req.params.apiToken,
      });

      res.send(200);
    } catch (e) {
      res.send(400, e);
      console.error(e);
    }

    return next();
  });

  server.post('claim/api-token', async (req, res, next) => {
    if (!req.username) {
      return next(new UnauthorizedError());
    }

    try {
      await controller.claimApiToken(req.username, req.params.apiToken);
      res.send(200);
    } catch (e) {
      res.send(400, e);
      console.error(e);
    }

    return next();
  });

  server.post('/forgot-my-password', (req, res, next) => {
    controller.forgotMyPasswordStart(req.params.email.toLowerCase()).then(
      () => {
        res.send(200);
        return next();
      },
      e => {
        console.error('\n== FORGOT-MY-PASSWORD ==\n', e);
        res.send(200);
        return next();
      }
    );
  });

  server.put('/forgot-my-password', (req, res, next) => {
    controller.forgotMyPasswordFinish(req.params.token, req.params.password).then(
      () => {
        res.send(200);
        return next();
      },
      e => {
        console.error('\n== FORGOT-MY-PASSWORD-FINISH ==\n', e);
        res.send(400, e);
        return next();
      }
    );
  });

  server.put('/users/me/privacy', async (req, res, next) => {
    if (!req.username) {
      return next(new UnauthorizedError());
    }

    try {
      await controller.setPrivacy(req.username, req.params.privacy);
      res.send(200);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });

  server.del('/users/me/privacy/:privacy', async (req, res, next) => {
    if (!req.username) {
      return next(new UnauthorizedError());
    }

    try {
      await controller.removePrivacy(req.username, req.params.privacy);
      res.send(200);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });

  const routeMap = {
    achievements: controller.achievements,
    bank: controller.bank,
    inventory: controller.inventory,
    materials: controller.materials,
    wallet: controller.wallet,
    dungeons: controller.dungeons,
    dyes: controller.dyes,
    finishers: controller.finishers,
    masteries: controller.masteries,
    minis: controller.minis,
    outfits: controller.outfits,
    raids: controller.raids,
    recipes: controller.recipes,
    skins: controller.skins,
    titles: controller.titles,
    nodes: controller.nodes,
    'mastery/points': controller.masteryPoints,
    mail: controller.mail,
    gliders: controller.gliders,
    mailcarriers: controller.mailCarriers,
    'home/cats': controller.homeCats,
    'home/nodes': controller.homeNodes,
    'pvp/heroes': controller.pvpHeroes,
    'pvp/stats': controller.pvpStats,
    'pvp/games': controller.pvpGames,
    'pvp/standings': controller.pvpStandings,
  };

  _.forEach(routeMap, (func, routeName) => {
    server.get(`/users/:alias/${routeName}`, async (req, res, next) => {
      try {
        const data = await func(req.params.alias, { email: req.username });
        res.send(200, data);
      } catch (e) {
        console.log(e);
        res.send(e.status);
      }

      return next();
    });
  });
}
