module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PvpStandings', {
    apiToken: {
      type: DataTypes.STRING,
      allowNull: false,
      onDelete: 'CASCADE',
      primaryKey: true,
      references: {
        model: 'Gw2ApiTokens',
        key: 'token',
      },
    },

    seasonId: {
      allowNull: false,
      type: DataTypes.STRING,
      primaryKey: true,
    },

    totalPointsCurrent: DataTypes.INTEGER,
    divisionCurrent: DataTypes.INTEGER,
    pointsCurrent: DataTypes.INTEGER,
    repeatsCurrent: DataTypes.INTEGER,
    ratingCurrent: DataTypes.INTEGER,
    decayCurrent: DataTypes.INTEGER,

    totalPointsBest: DataTypes.INTEGER,
    divisionBest: DataTypes.INTEGER,
    pointsBest: DataTypes.INTEGER,
    repeatsBest: DataTypes.INTEGER,
    ratingBest: DataTypes.INTEGER,
    decayBest: DataTypes.INTEGER,

    // leaderboard goodies (TODO: migration script)
    naRank: DataTypes.INTEGER,
    gw2aRank: DataTypes.INTEGER,
  });
};
