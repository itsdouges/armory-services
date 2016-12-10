const newFields = require('../lib/newFields');

const fields = (Sequelize = {}) => ({
  apiToken: {
    type: Sequelize.STRING,
    allowNull: true,
    onDelete: 'SET NULL',
    references: {
      model: 'Gw2ApiTokens',
      key: 'token',
    },
  },
});

module.exports = newFields(fields, 'Gw2Guilds');
