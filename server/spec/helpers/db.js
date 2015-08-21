var Sequelize = require('Sequelize');

module.exports = function () {
    return new Sequelize('database', 'username', 'password', {                                                                                                                                                             
        dialect: 'sqlite'
    });
}