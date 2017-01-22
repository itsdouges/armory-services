module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PvpStandings', {
    // REQUIRES MIGRATION (new field, new primary key)
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    apiToken: {
      // REQUIRED MIGRATION (STRING -> INT)
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      // REQUIRES MIGRATION (primaryKey: false)
      // primaryKey: true,
      references: {
        model: 'Gw2ApiTokens',
        key: 'id',
      },
    },

    seasonId: {
      allowNull: false,
      type: DataTypes.STRING,
      // REQUIRES MIGRATION (primaryKey: false)
      // primaryKey: true,
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
