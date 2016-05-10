function parseUser (user) {
  if (!user) {
    return Promise.reject('User not found');
  }

  return user.id;
}

function getUserIdByEmail (models, email) {
  return models.User.findOne({
    where: {
      email: email
    }
  })
  .then(parseUser);
}

function getUserIdByAlias (models, alias) {
  return models.User.findOne({
    where: {
      alias: alias,
    }
  })
  .then(parseUser);
}

function getUserPrimaryToken (models, alias) {
  return getUserIdByAlias(models, alias)
    .then(function (id) {
      return models
        .Gw2ApiToken
        .findOne({
          where: {
            primary: true,
          },
          include: [{
            model: models.User,
            where: {
              id: id,
            }
          }],
        });
    })
    .then(function (token) {
      if (!token) {
        return Promise.reject('Token not found');
      }

      return token.token;
    });
}

module.exports = {
  getUserPrimaryToken: getUserPrimaryToken,
  getUserIdByEmail: getUserIdByEmail,
  getUserIdByAlias: getUserIdByAlias,
};
