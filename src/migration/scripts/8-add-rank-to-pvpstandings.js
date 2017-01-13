const newFields = require('../lib/newFields');

const fields = (Sequelize = {}) => ({
  naRank: Sequelize.INTEGER,
  gw2aRank: Sequelize.INTEGER,
  euRank: Sequelize.INTEGER,
});

module.exports = newFields(fields, 'PvpStandings');
