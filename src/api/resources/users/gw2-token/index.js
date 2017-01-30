export default function tokenResourceFactory (server, controller) {
  server.get('/users/me/gw2-tokens', (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    return controller
      .list(req.username)
      .then((tokens) => {
        res.send(200, tokens);
        return next();
      }, (err) => {
        res.send(500, err);
        return next();
      });
  });

  server.post('/users/me/gw2-tokens', (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    return controller
      .add(req.username, req.params.token)
      .then((data) => {
        res.send(200, data);
        return next();
      }, (e) => {
        res.send(400, e);
        return next();
      });
  });

  server.del('/users/me/gw2-tokens/:token', (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    return controller
      .remove(req.username, req.params.token)
      .then(() => {
        res.send(200);
        return next();
      }, (err) => {
        res.send(500, err);
        return next();
      });
  });

  server.put('/users/me/gw2-tokens/:token/set-primary', (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    return controller
      .selectPrimary(req.username, req.params.token)
      .then(() => {
        res.send(200);
        return next();
      }, (err) => {
        res.send(500, err);
        return next();
      });
  });
}
