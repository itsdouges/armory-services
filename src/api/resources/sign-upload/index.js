// @flow

import type { Server } from 'restify';
import type { Models } from 'flowTypes';

import s3 from 'lib/s3';
import { read as readUser } from 'lib/services/user';

import createLogger from 'lib/gitter';

const logger = createLogger('SignUpload', 'errors');

export default function signUploadResource (server: Server, models: Models) {
  server.get('/sign-upload', async (req, res, next) => {
    try {
      if (!req.username) {
        return res.sendUnauthenticated();
      }

      const user = await readUser(models, { email: req.username });
      if (!user) {
        throw new Error('User does not exist');
      }

      const data = await s3.getSignedUrl({
        alias: user.alias,
        fileName: req.query.fileName,
        contentType: req.query.contentType,
      });

      res.send(200, data);
    } catch (e) {
      res.send(500);
      logger.log(JSON.stringify(e));
    }

    return next();
  });
}
