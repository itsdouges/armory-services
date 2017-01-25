const newFields = require('migration/lib/newFields');

const fields = (Sequelize = {}) => ({
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
  },
  stub: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

module.exports = newFields(fields, 'Gw2ApiTokens');

// Gw2ApiTokens
// 1. add id primary key
// 2. add stub field
// 3. make token not primary key

// Users
// 1. add stub field to
// 2. make Gw2ApiTokens foreign key reference new id field (Gw2ApiTokenToken -> Gw2ApiTokenId)

// Characters
// 1. make Gw2ApiTokens foreign key reference new id field (Gw2ApiTokenToken -> Gw2ApiTokenId)

// Guilds
// 1. make Gw2ApiTokens foreign key reference new id field (apiToken -> apiTokenId)

// PvpStandings
// 1. add id primary key
// 2. make apiToken not primary key
// 3. make seasonId not primary key
// 4. make Gw2ApiTokens foreign key reference new id field (apiToken -> apiTokenId)
