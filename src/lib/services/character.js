// eslint-disable-next-line import/prefer-default-export
export function list (models, { guild }) {
  return models.Gw2Character.findAll({
    where: {
      guild,
    },
    include: [{
      model: models.Gw2ApiToken,
      include: [{
        model: models.User,
      }],
    }],
  })
  .then((characters) => {
    return characters.map((c) => ({
      world: c.Gw2ApiToken.world,
      name: c.name,
      gender: c.gender,
      profession: c.profession,
      level: c.level,
      race: c.race,
      userAlias: c.Gw2ApiToken.User.alias,
      accountName: c.Gw2ApiToken.accountName,
    }));
  });
}
