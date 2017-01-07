const tableName = 'PvpStandings';

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
          apiToken: {
            type: Sequelize.STRING,
            allowNull: false,
            onDelete: 'CASCADE',
            primaryKey: true,
            references: {
              model: 'Gw2ApiTokens',
              key: 'token',
            },
          },

          seasonId: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
          },

          totalPointsCurrent: Sequelize.INTEGER,
          divisionCurrent: Sequelize.INTEGER,
          pointsCurrent: Sequelize.INTEGER,
          repeatsCurrent: Sequelize.INTEGER,
          ratingCurrent: Sequelize.INTEGER,
          decayCurrent: Sequelize.INTEGER,

          totalPointsBest: Sequelize.INTEGER,
          divisionBest: Sequelize.INTEGER,
          pointsBest: Sequelize.INTEGER,
          repeatsBest: Sequelize.INTEGER,
          ratingBest: Sequelize.INTEGER,
          decayBest: Sequelize.INTEGER,
        });
      });
  },
};
