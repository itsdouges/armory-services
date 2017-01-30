module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PvpStandings', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    apiTokenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'Gw2ApiTokens',
        key: 'id',
      },
    },
    seasonId: {
      allowNull: false,
      type: DataTypes.STRING,
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
    euRank: DataTypes.INTEGER,
    naRank: DataTypes.INTEGER,
    gw2aRank: DataTypes.INTEGER,
  });
};
