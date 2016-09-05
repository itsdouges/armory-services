'use strict';

var q = require('q');
var axios = require('axios');
var config = require('../../../env');

function Gw2TokenController (models, Validator, gw2Api) {
    var that = this;

    Validator.addResource({
        name: 'gw2-token',
        mode: 'add',
        rules: {
            token: ['valid-gw2-token', 'no-white-space']
        }
    });

    function getUserId (email) {
        return models.User.findOne({
            where: {
                email: email
            }
        })
        .then(function (user) {
            return user.id;
        });
    }

    Gw2TokenController.prototype.doesUserHaveTokens = function (userId) {
        return models
            .Gw2ApiToken
            .findAll({
                include: [{
                    model: models.User,
                    where: {
                        id: userId,
                    }
                }]
            })
      .then(function (data) {
        return !!data.length;
      });
    };

    Gw2TokenController.prototype.selectPrimary = function (email, token) {
        return getUserId(email)
            .then(function (id) {
                return models.Gw2ApiToken.update({
                    primary: false,
                }, {
                    where: {
                        UserId: id,
                    },
                })
                .then(function () {
                    return models.Gw2ApiToken.update({
                        primary: true,
                    }, {
                        where: {
                            UserId: id,
                            token: token
                        },
                    });
                });
            });
    };

    Gw2TokenController.prototype.add = function (email, token) {
        function addTokenToUser (id, gw2Token) {
            return gw2Api
                .readTokenInfoWithAccount(gw2Token)
                .then(function (tokenInfo) {
                    var wrappedToken = {
                        token: gw2Token,
                        UserId: id,
                        permissions: tokenInfo.info.join(','),
                        world: tokenInfo.world,
                        accountId: tokenInfo.accountId,
                        accountName: tokenInfo.accountName
                    };

          return that.doesUserHaveTokens(id)
            .then(function (hasTokens) {
                  wrappedToken.primary = !hasTokens;

                  return models
                    .Gw2ApiToken
                    .create(wrappedToken);
            });
                });
        }

        var validator = Validator({
            resource: 'gw2-token',
            mode: 'add'
        });

        return validator
            .validate({
                token: token
            })
            .then(function () {
                return models.User.findOne({
                    where: {
                        email: email
                    }
                });
            })
            .then(function (user) {
                    return user.id;
            })
            .then(function (id) {
                return addTokenToUser(id, token);
            })
            .then(function (createdToken) {
                console.log('Posting to: ' + config.ping.host + ':' + config.ping.port + '/fetch-characters');

                axios.post('http://' + config.ping.host + ':' + config.ping.port + '/fetch-characters', {
                    token: token
                });

                return createdToken;
            })
            .then(function (createdToken) {
                return {
                    token: createdToken.token,
                    accountName: createdToken.accountName,
                    permissions: createdToken.permissions,
                    world: createdToken.world,
                    primary: createdToken.primary,
                };
            });
    };

    Gw2TokenController.prototype.list = function (email) {
        return models
            .Gw2ApiToken
            .findAll({
                include: [{
                    model: models.User,
                    where: {
                        email: email
                    }
                }]
            })
            .then(function (tokens) {
                return tokens.map(function (token) {
                    return {
                        token: token.token,
                        accountName: token.accountName,
                        permissions: token.permissions,
                        world: token.world,
                        primary: token.primary,
                    };
                });
            });
    };

    Gw2TokenController.prototype.remove = function (email, token) {
        return models
            .User
            .findOne({
                where: {
                    email: email
                }
            })
            .then(function (user) {
                return user.id;
            })
            .then(function (id) {
                return models.Gw2ApiToken
                    .destroy({
                        where: {
                            UserId: id,
                            token: token
                        }
                    });
            });
    };
}

module.exports = Gw2TokenController;
