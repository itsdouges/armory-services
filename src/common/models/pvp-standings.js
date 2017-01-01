/* THIS IS COPIED FROM COMMON/MODELS */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Gw2PvpStandings', {
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
    totalPointsBest: DataTypes.INTEGER,
    divisionBest: DataTypes.INTEGER,
    pointsBest: DataTypes.INTEGER,
    repeatsBest: DataTypes.INTEGER,
  });
};
