function parseUser (user) {
  if (!user) {
    return Promise.reject('User not found');
  }

  return user.id;
}

function getUserByEmail (models, email) {
  return models.User.findOne({
    where: {
      email,
    },
  });
}

function getUserIdByEmail (models, email) {
  return getUserByEmail(models, email)
    .then(parseUser);
}

function getUserIdByAlias (models, alias) {
  return models.User.findOne({
    where: {
      alias,
    },
  })
  .then(parseUser);
}

function getUserPrimaryToken (models, alias) {
  return getUserIdByAlias(models, alias)
    .then((id) => models
      .Gw2ApiToken
      .findOne({
        where: {
          primary: true,
        },
        include: [{
          model: models.User,
          where: {
            id,
          },
        }],
      })
    )
    .then((token) => {
      if (!token) {
        return Promise.reject('Token not found');
      }

      return token.token;
    });
}

module.exports = {
  getUserPrimaryToken,
  getUserIdByEmail,
  getUserIdByAlias,
  getUserByEmail,
};
