const newFields = require('../lib/newFields');

const id = (Sequelize) => ({
  type: Sequelize.INTEGER,
  allowNull: false,
});

const stub = (Sequelize) => ({
  type: Sequelize.BOOLEAN,
  defaultValue: false,
  allowNull: false,
});

const tokenFields = (Sequelize) => ({
  id: id(Sequelize),
  stub: stub(Sequelize),
});

const userFields = (Sequelize) => ({
  stub: stub(Sequelize),
});

const apiTokenId = (Sequelize) => ({
  type: Sequelize.INTEGER,
  allowNull: true,
});

const apiTokenIdFields = (Sequelize) => ({
  apiTokenId: apiTokenId(Sequelize),
});

const standingsFields = (Sequelize) => ({
  id: id(Sequelize),
  apiTokenId: apiTokenId(Sequelize),
});

module.exports = {
  up (queryInterface, Sequelize) {
    const { up: addTokenFields } = newFields(tokenFields, 'Gw2ApiTokens');
    const { up: addUserFields } = newFields(userFields, 'Users');
    const { up: addGuildField } = newFields(apiTokenIdFields, 'Gw2Guilds');
    const { up: addCharacterField } = newFields(apiTokenIdFields, 'Gw2Characters');
    const { up: addStandingFields } = newFields(standingsFields, 'PvpStandings');

    return Promise.all([
      addTokenFields(queryInterface, Sequelize),
      addGuildField(queryInterface, Sequelize),
      addCharacterField(queryInterface, Sequelize),
      addStandingFields(queryInterface, Sequelize),
      addUserFields(queryInterface, Sequelize),
    ])
    .then(([message]) => {
      if (message === 'COMPLETE') {
        return undefined;
      }

      return queryInterface.renameColumn('Gw2Guilds', 'token', 'id')
        .then(() => queryInterface.changeColumn('Gw2Guilds', 'motd', {
          // eslint-disable-next-line
          type: Sequelize.STRING(1000),
          collate: 'utf8_general_ci',
          charset: 'utf8',
        }))
        .then(() => queryInterface.changeColumn('Gw2Guilds', 'tag', {
          type: Sequelize.STRING,
          allowNull: true,
        }))
        .then(() => queryInterface.sequelize.query(
          'drop table armory.Gw2PvpStandings'
        ))
        .then(() => queryInterface.sequelize.query(
          'alter table armory.Gw2Guilds drop foreign key apiToken_foreign_idx'
        ))
        .then(() => queryInterface.sequelize.query(
          'alter table armory.Gw2Characters drop foreign key Gw2Characters_ibfk_1'
        ))
        .then(() => queryInterface.sequelize.query(
          'alter table armory.PvpStandings drop foreign key PvpStandings_ibfk_1'
        ))
        .then(() => queryInterface.sequelize.query(`
          alter table armory.Gw2ApiTokens
          drop primary key,
          modify id int auto_increment not null primary key
        `))
        .then(() => queryInterface.sequelize.query(
          // Turn safe mode off as we are updating
          // using token which isn't a primary key anymore.
          'SET SQL_SAFE_UPDATES = 0'
        ))
        .then(() => queryInterface.sequelize.query(`
          update armory.Gw2Characters
          set apiTokenId = (
            select id
            from armory.Gw2ApiTokens
            where token = armory.Gw2Characters.Gw2ApiTokenToken
          )
        `))
        .then(() => queryInterface.sequelize.query(`
          update armory.Gw2Guilds
          set apiTokenId = (
            select id
            from armory.Gw2ApiTokens
            where token = armory.Gw2Guilds.apiToken
          )
        `))
        .then(() => queryInterface.sequelize.query(`
          update armory.PvpStandings
          set apiTokenId = (
            select id
            from armory.Gw2ApiTokens
            where token = armory.PvpStandings.apiToken
          )
        `))
        .then(() => queryInterface.sequelize.query(`
          alter table armory.Gw2Characters
          add foreign key (apiTokenId)
          references armory.Gw2ApiTokens(id)
          on delete cascade
          on update cascade
        `))
        .then(() => queryInterface.sequelize.query(`
          alter table armory.Gw2Guilds
          add foreign key (apiTokenId)
          references armory.Gw2ApiTokens(id)
          on delete cascade
          on update cascade
        `))
        .then(() => queryInterface.sequelize.query(`
          alter table armory.PvpStandings
          add foreign key (apiTokenId)
          references armory.Gw2ApiTokens(id)
          on delete set null
          on update cascade
        `))
        .then(() => queryInterface.sequelize.query(`
          alter table armory.PvpStandings
          drop primary key,
          modify id int auto_increment not null primary key
        `))
        .then(() => queryInterface.removeColumn('Gw2Characters', 'Gw2ApiTokenToken'))
        .then(() => queryInterface.removeColumn('Gw2Guilds', 'apiToken'))
        .then(() => queryInterface.removeColumn('PvpStandings', 'apiToken'));
    });
  },
};
