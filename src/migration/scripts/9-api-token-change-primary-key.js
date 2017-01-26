const newFields = require('../lib/newFields');

const tokenFields = (Sequelize) => ({
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  stub: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

const apiTokenIdField = (onDelete = 'CASCADE') => (Sequelize) => ({
  apiTokenId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    onDelete,
  },
});

module.exports = {
  up (queryInterface, Sequelize) {
    const { up: addTokenFields } = newFields(tokenFields, 'Gw2ApiTokens');
    const { up: addGuildField } = newFields(apiTokenIdField(), 'Gw2Guilds');
    const { up: addCharacterField } = newFields(apiTokenIdField(), 'Gw2Characters');
    const { up: addStandingField } = newFields(apiTokenIdField('SET NULL'), 'PvpStandings');

    return Promise.all([
      addTokenFields(queryInterface, Sequelize),
      addGuildField(queryInterface, Sequelize),
      addCharacterField(queryInterface, Sequelize),
      addStandingField(queryInterface, Sequelize),
    ]).then(() => {
      queryInterface.sequelize.query(
        'alter table armory.Gw2Guilds drop foreign key Gw2Guilds_ibfk_1'
      );

      queryInterface.sequelize.query(
        'alter table armory.Gw2Characters drop foreign key Gw2Characters_ibfk_1'
      );

      queryInterface.sequelize.query(
        'alter table armory.PvpStandings drop foreign key PvpStandings_ibfk_1'
      );

      queryInterface.sequelize.query(`
        alter table armory.Gw2ApiTokens
        drop primary key,
        modify id INT AUTO_INCREMENT NOT NULL primary key
        `);

      // set apiTokenId fields
      // set foreign key constraints again
    });
  },
};

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
