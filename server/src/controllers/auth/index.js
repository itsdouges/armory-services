'use strict';

var crypto = require('crypto');
var password = require('password-hash-and-salt');
var q = require('q');

function AuthController(models, config) {
    /**
     * Authenticated tokens.
     * Checks the db to see if the token exists, if it does sets the
     * response username and calls back with true.
     *
     * It is assumed if we've come this far that the token hasn't expired.
     */
    function authenticateToken (token, req, cb) {
        models.UserToken
            .findOne({
                where: {
                    token: token
                }
            })
            .then(function (item) {
                if (!item) {
                    // no token exists
                    cb(null, false);
                } else {
                    req.username = item.email;
                    cb(null, true);
                }
            }, function (err) {
                cb(err, null);
            });
    };

    /**
     * generateToken
     * Generates a JWT for a user.
     */
    function generateToken (data) {
        var random = Math.floor(Math.random() * 100001);
        var timestamp = (new Date()).getTime();
        var sha256 = crypto.createHmac('sha256', random + config.secret + timestamp);

        return sha256.update(data).digest('base64');
    }

    // todo: this is duplicated between here and user controller.
    // lets do something about that.
    var verifyHash = function (hash, userPassword) {
        var defer = q.defer();

        password(userPassword).verifyAgainst(hash, function (error, verified) {
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
        models
            .User
            .findOne({
                where: {
                    email: credentials.username
                }
            })
            .then(function (user) {
                if (!user) {
                    return q.reject();
                }

                return verifyHash(user.passwordHash, credentials.password);
            })
            .then(function () {
                // valid
                 var token = generateToken(credentials.username + ':' + credentials.password);

                 models.UserToken
                    .create({
                        token: token,
                        email: credentials.username
                    })
                    .then(function () {
                         // add token to db
                        return cb(null, token);
                    });
            }, function (err) {
                if (err) {
                    // error occurred
                    cb(err, null);
                } else {
                    // not valid
                    cb(null, false);
                }
            });
    };

    /**
     * ValidateClient
     * This isn't used at the moment.
     */
    function validateClient (credentials, req, cb) {
        cb(null, true);
    }

    return {
        validateClient: validateClient,
        authenticateToken: authenticateToken,
        grantUserToken: grantUserToken
    };
}

module.exports = AuthController;