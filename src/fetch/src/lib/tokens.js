module.exports = function readTokens (models) {
  return models.Gw2ApiToken
    .findAll()
    .then((items) => items.map((item) => ({
      token: item.dataValues.token,
      permissions: item.dataValues.permissions,
    })));
};
