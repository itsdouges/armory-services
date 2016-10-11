module.exports = function readTokens (models) {
  return models.Gw2ApiToken
    .findAll()
    .then((items) => items.map((item) => item.dataValues.token));
};
