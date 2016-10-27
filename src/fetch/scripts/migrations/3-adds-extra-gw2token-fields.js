const newFields = require('./newFields');

const fields = (Sequelize = {}) => ({
  created: {
    type: Sequelize.STRING,
  },
  access: {
    type: Sequelize.STRING,
  },
  commander: {
    type: Sequelize.BOOLEAN,
  },
  fractalLevel: {
    type: Sequelize.INTEGER,
  },
  dailyAp: {
    type: Sequelize.INTEGER,
  },
  monthlyAp: {
    type: Sequelize.INTEGER,
  },
  wvwRank: {
    type: Sequelize.INTEGER,
  },
});

module.exports = newFields(fields);
