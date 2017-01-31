// @flow

// Used for sequelize-cli migrations.

require('babel-core/register');
require('../base');

module.exports = require('./').default.db;
