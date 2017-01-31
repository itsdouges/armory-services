export default function charactersResource (server, controller) {
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

  server.get('users/:alias/characters', (req, res, next) => {
    controller
      .list({ alias: req.params.alias, ignorePrivacy: !!req.username, email: req.username })
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
      .read(req.params.name, { ignorePrivacy: !!req.username, email: req.username })
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
}
