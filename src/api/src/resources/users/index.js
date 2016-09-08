const RESOURCE = {
  get: '/users/me',
  put: '/users/me/password',
  post: '/users',
  forgotMyPassword: '/users/forgot-my-password',
  publicGet: '/users/:alias',
};

function UserResource (server, controller) {
  server.get(RESOURCE.get, (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    return controller
      .read(req.username)
      .then((data) => {
        res.send(200, data);
        return next();
      });
  });

  server.get(RESOURCE.publicGet, (req, res, next) => {
    controller
      .readPublic(req.params.alias)
      .then((data) => {
        res.send(200, data);
        return next();
      }, () => {
        // todo: error handling
        res.send(404);
        return next();
      });
  });

  server.put(RESOURCE.put, (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    return controller
      .updatePassword({
        email: req.username,
        password: req.params.password,
        currentPassword: req.params.currentPassword,
      })
      .then(() => {
        res.send(200);
        return next();
      }, (e) => {
        res.send(400, e);
        return next();
      });
  });

  server.post(RESOURCE.post, (req, res, next) => {
    controller
      .create({
        alias: req.params.alias,
        email: req.params.email.toLowerCase(),
        password: req.params.password,
      })
      .then(() => {
        res.send(200);
        return next();
      }, (e) => {
        res.send(400, e);
        return next();
      });
  });

  server.post(RESOURCE.forgotMyPassword, (req, res, next) => {
    controller
      .forgotMyPasswordStart(req.params.email.toLowerCase())
      .then(() => {
        res.send(200);
        return next();
      }, (e) => {
        console.error('\n== FORGOT-MY-PASSWORD ==\n', e);
        res.send(200);
        return next();
      });
  });

  server.put(RESOURCE.forgotMyPassword, (req, res, next) => {
    controller
      .forgotMyPasswordFinish(req.params.guid, req.params.password)
      .then(() => {
        res.send(200);
        return next();
      }, (e) => {
        console.error('\n== FORGOT-MY-PASSWORD-FINISH ==\n', e);
        res.send(400);
        return next(e);
      });
  });
}

module.exports = UserResource;
