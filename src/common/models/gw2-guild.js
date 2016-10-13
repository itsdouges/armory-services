/* THIS IS COPIED FROM COMMON/MODELS */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Gw2Guild', {
    id: {
      // This has caused the field to be called token! Rename it to id.
      field: 'token',
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      field: 'name',
      type: DataTypes.STRING,
      allowNull: false,
    },
    tag: {
      field: 'tag',
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};
