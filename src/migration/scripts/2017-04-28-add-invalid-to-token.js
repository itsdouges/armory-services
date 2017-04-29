const newFields = require('../lib/newFields');

const fields = (Sequelize = {}) => ({
  valid: Sequelize.BOOLEAN,
});

module.exports = newFields(fields, 'Gw2ApiToken');
