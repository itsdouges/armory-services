/* THIS IS COPIED FROM COMMON/MODELS */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('UserReset', {
    id: {
      type: DataTypes.UUID,
      field: 'id',
      required: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    used: {
      type: DataTypes.BOOLEAN,
      field: 'used',
      required: true,
      defaultValue: false,
    },
  });
};
