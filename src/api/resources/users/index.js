export default function UserResource (server, controller) {
  server.get('/users/me', (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    return controller.read({ email: req.username, excludeChildren: true })
      .then((data) => {
        res.send(200, data);
        return next();
      });
  });

  server.get('/users/:alias', (req, res, next) => {
    return controller.read({
      alias: req.params.alias,
      email: req.username,
      ignorePrivacy: !!req.username,
    })
    .then((data) => {
      res.send(200, data);
      return next();
    }, (err) => {
      console.error(err);
      res.send(404);
      return next();
    });
  });

  server.put('/users/me/password', (req, res, next) => {
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

  server.post('/users', (req, res, next) => {
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
      return res.sendUnauthenticated();
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

  server.put('/forgot-my-password', (req, res, next) => {
    controller
      .forgotMyPasswordFinish(req.params.token, req.params.password)
      .then(() => {
        res.send(200);
        return next();
      }, (e) => {
        console.error('\n== FORGOT-MY-PASSWORD-FINISH ==\n', e);
        res.send(400, e);
        return next();
      });
  });
}
