const Sequelize = require('sequelize');

global.chai = require('chai');
global.sinon = require('sinon');
global.expect = require('chai').expect;
global.AssertionError = require('chai').AssertionError;

const sinonChai = require('sinon-chai');

global.chai.use(sinonChai);

module.exports = function () {
  return new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    logging: false,
  });
};

