// @flow

import type { Server } from 'restify';

export default function charactersResource (server: Server, controller: any) {
  server.get('random/characters/:n', (req, res, next) => {
    controller
      .random(req.params.n)
      .then((name) => {
        res.send(200, name);
        return next();
      }, (error) => {
        console.log(error);
        res.send(500);
        return next();
      });
  });

  server.get('of-the-day/characters', (req, res, next) => {
    controller
      .charactersOfTheDay()
      .then((name) => {
        res.send(200, name);
        return next();
      }, (error) => {
        console.log(error);
        res.send(500);
        return next();
      });
  });

  server.get('users/:alias/characters', (req, res, next) => {
    controller
      .list({ alias: req.params.alias, email: req.username })
      .then((characters) => {
        res.send(200, characters);
        return next();
      }, (error) => {
        console.error(error);
        res.send(500);
        return next();
      });
  });

  server.get('characters/:name', (req, res, next) => {
    controller
      .read(req.params.name, { email: req.username })
      .then((character) => {
        if (character) {
          res.send(200, character);
        } else {
          res.send(404);
        }

        return next();
      }, (error) => {
        console.log(error);
        res.send(500);
        return next();
      });
  });

  server.put('characters/:name', (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    return controller
      .update(req.username, req.params)
      .then(() => {
        res.send(200);
        return next();
      }, (error) => {
        console.log(error);
        res.send(500);
        return next();
      });
  });

  server.put('/characters/:name/privacy', async (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    try {
      await controller.setPrivacy(req.params.name, req.username, req.params.privacy);
      res.send(200);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });

  server.del('/characters/:name/privacy/:privacy', async (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    try {
      await controller.removePrivacy(req.params.name, req.username, req.params.privacy);
      res.send(200);
    } catch (e) {
      res.send(500, e);
    }

    return next();
  });
}
