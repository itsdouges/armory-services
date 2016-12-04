const newFields = require('./newFields');

const fields = (Sequelize = {}) => ({
  guilds: {
    type: Sequelize.STRING,
  },
});

module.exports = newFields(fields, 'Gw2ApiTokens');
