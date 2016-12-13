import path from 'path';
import { addPath } from 'app-module-path';
import 'babel-polyfill';

addPath(path.join(__dirname, '..', '/'));

const Sequelize = require('sequelize');
const Models = require('../src/models');

global.chai = require('chai');

global.chai.should();

global.sinon = require('sinon');
global.expect = require('chai').expect;
global.AssertionError = require('chai').AssertionError;

const sinonChai = require('sinon-chai');

const chaiAsPromised = require('chai-as-promised');

global.chai.use(chaiAsPromised);
global.chai.use(sinonChai);

global.testDb = function () {
  return new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    logging: false,
  });
};

const seed = function (models, options) {
  if (options.addTokens === undefined) {
    // eslint-disable-next-line
    options.addTokens = true;
  }

  return models
    .User
    .create({
      email: options.email,
      alias: options.alias,
      passwordHash: 'lolz',
    })
    .then((user) => {
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
        .then(() => {
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
        .then(() => {
          return user.id;
        });
    });
};

global.seedData = function (seedDb, options) {
  const models = new Models(testDb());
  return models.sequelize.sync({
    force: true,
  })
  .then(() => {
    if (seedDb) {
      return seed(models, options);
    }

    return undefined;
  })
  .then(() => models);
};

global.setupTestDb = seedData;
