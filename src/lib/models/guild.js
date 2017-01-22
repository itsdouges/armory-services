module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Gw2Guild', {
    id: {
      // MIGRATION! token -> id
      // field: 'token',
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
      // REQUIRED MIGRATION (STRING -> INT
      type: DataTypes.INTEGER,
      allowNull: true,
      onDelete: 'SET NULL',
      references: {
        model: 'Gw2ApiTokens',
        // MIGRATION! token -> id
        // key: 'token',
        key: 'id',
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
