const tableName = 'Gw2PvpStandings';

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface
      .describeTable(tableName)
      .then((table) => {
        if (table) {
          console.log('Migration not needed, aborting.');
          return undefined;
        }

        return queryInterface.createTable(tableName, {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          apiToken: {
            type: Sequelize.STRING,
            allowNull: false,
            onDelete: 'CASCADE',
            references: {
              model: 'Gw2ApiTokens',
              key: 'token',
            },
          },
          seasonId: Sequelize.STRING,
          totalPointsCurrent: Sequelize.INTEGER,
          divisionCurrent: Sequelize.INTEGER,
          pointsCurrent: Sequelize.INTEGER,
          repeatsCurrent: Sequelize.INTEGER,
          totalPointsBest: Sequelize.INTEGER,
          divisionBest: Sequelize.INTEGER,
          pointsBest: Sequelize.INTEGER,
          repeatsBest: Sequelize.INTEGER,
        });
      });
  },
};
