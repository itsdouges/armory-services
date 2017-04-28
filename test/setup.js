import path from 'path';
import { addPath } from 'app-module-path';
import Sequelize from 'sequelize';

addPath(path.join(__dirname, '..', ''));
addPath(path.join(__dirname, '..', '/src'));

const Models = require('../src/lib/models');

global.chai = require('chai');
global.sinon = require('sinon');
global.expect = require('chai').expect;
global.AssertionError = require('chai').AssertionError;

global.chai.should();
global.chai.use(require('chai-as-promised'));
global.chai.use(require('sinon-chai'));

const createTestDb = () => {
  return new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    logging: false,
  });
};

async function seed (models, {
  addTokens = true,
  apiToken,
  email,
  alias,
} = {}) {
  const user = await models.User.create({
    email: email || 'cool@email.com',
    alias: alias || 'huedwell',
    passwordHash: 'realhashseriously',
  });

  const token = await models.Gw2ApiToken.create({
    token: apiToken ||
      '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15',
    accountName: 'cool.4321',
    accountId: 'haha_id',
    permissions: 'cool,permissions',
    world: 1234,
    UserId: user.id,
  });

  await models.Gw2Character.create({
    name: 'character',
    race: 'race',
    gender: 'gender',
    profession: 'profession',
    level: 69,
    created: '01/01/90',
    age: 20,
    deaths: 2,
    apiTokenId: token.id,
  });

  await models.Gw2ApiToken.create({
    token: '25E6FAC3-1912-7E47-9420-2965C5E4D63DEAA54B0F-092E-48A8-A2AE-9E197DF4BC8B',
    accountName: 'cool.4322',
    accountId: 'haha_iddd',
    permissions: 'cool,permissions',
    world: 1234,
    UserId: user.id,
  });

  if (!addTokens) {
    return user.id;
  }

  await models.Gw2ApiToken.create({
    token: 'cool_token',
    accountName: 'madou.0',
    permissions: 'he,he',
    accountId: '12341234',
    world: 1234,
    UserId: user.id,
    primary: true,
  });

  await models.Gw2ApiToken.create({
    token: 'another_token',
    accountName: 'madou.1',
    permissions: 'he,he',
    accountId: '4321431',
    world: 4321,
    UserId: user.id,
  });

  return user.id;
}

async function setupTestDb ({ seed: seedDb, ...options } = {}) {
  const models = new Models(createTestDb());

  await models.sequelize.sync({
    force: true,
  });

  if (seedDb) {
    await seed(models, options);
  }

  return models;
}

global.setupTestDb = setupTestDb;

const proxyquire = require('proxyquire').noCallThru();

global.proxyquire = (modulePath, stubs, ...args) => {
  const module = proxyquire(modulePath, stubs, ...args);

  if (module.default) {
    return module.default;
  }

  return module;
};

// Fail tests when a promise rejects, but isn't caught
// See also: http://2ality.com/2016/04/unhandled-rejections.html
process.on('unhandledRejection', (rejection) => {
  throw rejection;
});

// It's possible to store a promise, then at some time in the future, attach a
// `.catch()` which handles any errors. While this is _possible_, it's not a
// good pattern (too easy to forget to attach a `.catch()`), so node throws a
// warning on the next tick if a promise hasn't been given a `.catch()`.
// This log gives a much more meaningful stack trace for hunting down the issues
// in node >= 7.9
// See also: http://stackoverflow.com/a/40921505/473961
process.on('warning', (warning) => {
  if (warning.name === 'PromiseRejectionHandledWarning') {
    console.log(warning.stack);
  }
});
