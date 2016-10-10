function charactersResource (server, controller) {
  server.get('random/character', (req, res, next) => {
    controller
      .random()
      .then((name) => {
        res.send(200, name);
        return next();
      }, (error) => {
        console.log(error);
        res.send(500);
        return next();
      });
  });

  server.get('characters/:name', (req, res, next) => {
    controller
      .read(req.params.name, false)
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

module.exports = charactersResource;
