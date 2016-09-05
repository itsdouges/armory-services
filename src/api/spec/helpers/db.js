var Sequelize = require('sequelize');

module.exports = function () {
  return new Sequelize('database', 'username', 'password', {                                                                                                                                                             
    dialect: 'sqlite',
    logging: false
  });
}