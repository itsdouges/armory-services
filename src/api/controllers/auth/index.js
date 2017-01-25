import crypto from 'crypto';
import password from 'password-hash-and-salt';
import q from 'q';

export default function authControllerFactory (models, config) {
  /**
   * Authenticated tokens.
   * Checks the db to see if the token exists, if it does sets the
   * response username and calls back with true.
   *
   * It is assumed if we've come this far that the token hasn't expired.
   */
  function authenticateToken (token, req, cb) {
    models.UserToken.findOne({
      where: {
        token,
      },
    })
    .then((item) => {
      if (!item) {
        // no token exists
        cb(null, false);
      } else {
        // eslint-disable-next-line
        req.username = item.email;
        cb(null, true);
      }
    }, (err) => {
      cb(err, null);
    });
  }

  /**
   * generateToken
   * Generates a JWT for a user.
   */
  function generateToken (data) {
    const random = Math.floor(Math.random() * 100001);
    const timestamp = (new Date()).getTime();
    const sha256 = crypto.createHmac('sha256', random + config.jwtTokens.secret + timestamp);

    return sha256.update(data).digest('base64');
  }

  // todo: this is duplicated between here and user controller.
  // lets do something about that.
  const verifyHash = (hash, userPassword) => {
    const defer = q.defer();

    password(userPassword).verifyAgainst(hash, (error, verified) => {
      if (error) {
        return defer.reject(error);
      }

      if (!verified) {
        return defer.reject();
      }

      return defer.resolve();
    });

    return defer.promise;
  };

  /**
   * GrantUserToken
   * Grants a token if the user credentials were successfully validated,
   * and then stores said token + email in the UserToken db.
   */
  function grantUserToken (credentials, req, cb) {
    models.User.findOne({
      where: {
        email: credentials.username,
      },
    })
    .then((user) => {
      if (!user) {
        return q.reject();
      }

      return verifyHash(user.passwordHash, credentials.password);
    })
    .then(() => {
      // valid
      const token = generateToken(`${credentials.username}:${credentials.password}`);

      models.UserToken
          .create({
            token,
            email: credentials.username,
          })
          .then(() => {
             // add token to db
            return cb(null, token);
          });
    }, (err) => {
      if (err) {
        // error occurred
        cb(err, null);
      } else {
        // not valid
        cb(null, false);
      }
    });
  }

  /**
   * ValidateClient
   * This isn't used at the moment.
   */
  function validateClient (credentials, req, cb) {
    cb(null, true);
  }

  return {
    validateClient,
    authenticateToken,
    grantUserToken,
  };
}
