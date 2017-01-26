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
    apiToken: {
      type: DataTypes.STRING,
      allowNull: true,
      onDelete: 'SET NULL',
      references: {
        model: 'Gw2ApiTokens',
        key: 'token',
      },
    },
    favor: {
      type: DataTypes.INTEGER,
    },
    resonance: {
      type: DataTypes.INTEGER,
    },
    aetherium: {
      type: DataTypes.INTEGER,
    },
    influence: {
      type: DataTypes.INTEGER,
    },
    level: {
      type: DataTypes.INTEGER,
    },
    motd: {
      // eslint-disable-next-line new-cap
      type: DataTypes.STRING(1000),
    },
  });
};
