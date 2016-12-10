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
  favor: {
    type: Sequelize.INTEGER,
  },
  resonance: {
    type: Sequelize.INTEGER,
  },
  aetherium: {
    type: Sequelize.INTEGER,
  },
  influence: {
    type: Sequelize.INTEGER,
  },
  level: {
    type: Sequelize.INTEGER,
  },
  motd: {
    type: Sequelize.STRING,
  },
});

module.exports = newFields(fields, 'Gw2Guilds');
