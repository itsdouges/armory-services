import s3 from 'lib/s3';
import { getUserByEmail } from 'lib/services/user';

export default function signUploadResource (server, models) {
  server.get('/sign-upload', (req, res, next) => {
    if (!req.username) {
      return res.sendUnauthenticated();
    }

    return getUserByEmail(models, req.username)
      .then((user) => {
        s3.getSignedUrl({
          alias: user.alias,
          fileName: req.query.fileName,
          contentType: req.query.contentType,
        })
        .then((data) => {
          res.send(200, data);
          return next();
        });
      }, () => {
        res.send(500);
        return next();
      });
  });
}
