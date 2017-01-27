module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserToken', {
    id: {
      type: DataTypes.UUID,
      required: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      required: true,
    },
    token: {
      type: DataTypes.STRING,
      required: true,
    },
  });
};
