var s3 = require('../../lib/s3');
var userHelper = require('../../lib/get-user-info');

module.exports = function (server, models) {
  server.get('/sign-upload', function (req, res, next) {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    userHelper.getUserByEmail(models, req.username)
      .then(function (user) {
        s3.getSignedUrl({
          alias: user.alias,
          fileName: req.query.fileName,
          contentType: req.query.contentType,
        })
        .then(function (data) {
          res.send(200, data);
          return next();
        });
      }, function () {
        res.send(500);
        return next();
      });
  });
};
