const newFields = require('../lib/newFields');

const fields = (Sequelize = {}) => ({
  wins: {
    type: Sequelize.INTEGER,
  },
  losses: {
    type: Sequelize.INTEGER,
  },
});

module.exports = newFields(fields, 'PvpStandings');
