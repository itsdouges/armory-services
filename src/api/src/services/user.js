export function list (models, { guild }) {
  return models.Gw2ApiToken.findAll({
    where: {
      guilds: {
        $like: `%${guild}%`,
      },
    },
    include: [{
      model: models.User,
    }],
  })
  .then((tokens) => {
    return tokens.map((token) => ({
      name: token.User.alias,
      accountName: token.accountName,
    }));
  });
}

export function isUserInGuild (models, email, guildId) {
  return models.Gw2ApiToken.findAll({
    where: {
      guilds: {
        $like: `%${guildId}%`,
      },
    },
    include: [{
      model: models.User,
      where: {
        email,
      },
    }],
  })
  .then((found) => !!found.length);
}
