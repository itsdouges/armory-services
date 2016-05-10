var Models = require('../../src/models');
var testDb = require('./db');

var seed = function (models, options) {
  if (options.addTokens === undefined) {
    options.addTokens = true;
  }

  return models
    .User
    .create({
      email: options.email,
      alias: options.alias,
      passwordHash: 'lolz',
    })
    .then(function (user) {
      if (!options.addTokens) {
        return user.id;
      }

      return models
        .Gw2ApiToken
        .create({
          token: 'cool_token',
          accountName: 'madou.0',
          permissions: 'he,he',
          accountId: '12341234',
          world: 1234,
          UserId: user.id,
          primary: true,
        })
        .then(function () {
          return models
            .Gw2ApiToken
            .create({
              token: 'another_token',
              accountName: 'madou.1',
              permissions: 'he,he',
              accountId: '4321431',
              world: 4321,
              UserId: user.id,
            });
        })
        .then(function () {
          return user.id;
        });
    });
};

module.exports = function (seedDb, options) {
  var models = new Models(testDb());
  return models.sequelize.sync({
    force: true
  })
  .then(function () {
    if (seedDb) {
      return seed(models, options); 
    }
  })
  .then(function () {
    return models;
  });
};
