'use strict';

// todo: use sequelize transactions where appropriate!
var password = require('password-hash-and-salt');
var q = require('q');

var CharacterController = require('../character');

function UsersResource(models, Validator, gw2Api) {
    var scope = this;

    // move to helper?
    var hashPassword = function (userPass) {
        var defer = q.defer();

        password(userPass).hash(function (error, hash) {
            if (error) {
                defer.reject(error);
            }

            return defer.resolve(hash);
        });

        return defer.promise;
    };

    // move to helper?
    var verifyHash = function (hash, userPassword) {
        var defer = q.defer();

        password(userPassword).verifyAgainst(hash, function (error, verified) {
            if (error) {
                return defer.reject(error);
            }

            if (!verified) {
                return defer.reject('Bad password');
            }

            return defer.resolve();
        });

        return defer.promise;
    };

    Validator
        .addResource({
            name: 'users',
            mode: 'create',
            rules: {
                alias: ['required', 'unique-alias', 'no-white-space', 'min5'],
                email: ['required', 'unique-email', 'no-white-space'],
                password: ['required', 'ezpassword', 'no-white-space']
            }
        }).addResource({
            name: 'users',
            mode: 'update-password',
            rules: {
                email: 'required',
                currentPassword: ['required'],
                password: ['required', 'ezpassword', 'no-white-space']
            }
        });

    /**
     * Create user resource.
     * Email and password are required, gw2 api tokens are optional.
     */
    UsersResource.prototype.create = function (user) {
        var validator = Validator({
            resource: 'users',
            mode: 'create'
        });

        return validator.validate(user)
            .then(function () {
                return hashPassword(user.password);
            })
            .then(function (passwordHash) {
                user.passwordHash = passwordHash;
                return models.User.create(user);
            });
    };

    /**
     * Read user resource.
     * Finding by email as that is what the user will be using for their
     * login credentials.
     */
    UsersResource.prototype.read = function (email) {
        return models
            .User
            .findOne({
                where: {
                    email: email
                }
            })
            .then(function (data) {
                return data.dataValues;
            })
            .then(function (data) {
                var characterController = new CharacterController(models, gw2Api);

                return characterController
                    .list(email)
                    .then(function (characters) {
                        data.characters = characters;

                        return data;
                    });
            });
    };

    /**
     * Read user resource.
     * Finding by email as that is what the user will be using for their
     * login credentials.
     */
    UsersResource.prototype.readPublic = function (alias) {
        return models
            .User
            .findOne({
                where: {
                    alias: alias
                }
            })
            .then(function (result) {
                if (!result) {
                    return Promise.reject();
                }

                return result.dataValues;
            })
            .then(function (data) {
                var characterController = new CharacterController(models, gw2Api);

                return characterController
                    .list(null, data.alias)
                    .then(function (characters) {
                        var dataOut = {
                            alias: data.alias,
                            createdAt: data.createdAt,
                            characters: characters
                        };

                        return dataOut;
                    });
            });
    };

  /**
   * Update user resource.
   * Currently only changing your password is supported.
   */
  UsersResource.prototype.updatePassword = function (user) {
      var validator = Validator({
          resource: 'users',
          mode: 'update-password'
      });

      var promise = validator
          .validate(user)
          .then(function () {
              return scope.read(user.email);
          })
          .then(function (userData) {
              return verifyHash(userData.passwordHash, user.currentPassword)
                  .then(function () {
                      return user.password;
                  });
          })
          .then(function (newPassword) {
              return hashPassword(newPassword);
          })
          .then(function (newHash) {
              user.passwordHash = newHash;

              return models.User.update({
                  passwordHash: newHash
              }, {
                  where: {
                      email: user.email
                  }
              });
          });

      return promise;
  };

  UsersResource.prototype.initForgotMyPassword = function (email) {
    // find user with email
    // if exists create row in user reset table
    // send email with id from fresh row
    // return 200
  };

  UsersResource.prototype.completeForgotMyPassword = function (guid, newPassword, newPasswordConfirm) {
    // validate token
    // validate passwords
    // change password if everything is A-OK
    // set user-reset row to used
  };
}

module.exports = UsersResource;
