module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserToken', {
    id: {
      type: DataTypes.UUID,
      field: 'id',
      required: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      field: 'email',
      required: true,
    },
    token: {
      type: DataTypes.STRING,
      field: 'token',
      required: true,
    },
  });
};
