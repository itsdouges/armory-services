module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PvpStandings', {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    apiToken: {
      type: DataTypes.STRING,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'Gw2ApiTokens',
        key: 'token',
      },
    },

    seasonId: DataTypes.STRING,

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
  });
};
