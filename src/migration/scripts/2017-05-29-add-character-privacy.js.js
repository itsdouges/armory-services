const newFields = require('../lib/newFields');

const fields = (Sequelize = {}) => ({
  privacy: Sequelize.STRING,
});

module.exports = newFields(fields, 'Gw2Characters');
