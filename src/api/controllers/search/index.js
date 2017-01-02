const parseAccountName = require('lib/user').parseAccountName;

function controller (models) {
  function search (term) {
    const users = models.User.findAll({
      where: {
        alias: {
          $like: `%${term}%`,
        },
      },
      include: {
        all: true,
      },
    })
    .then((results) => {
      /* eslint arrow-body-style:0 */
      return results.map((result) => ({
        resource: 'users',
        name: result.alias,
        accountName: parseAccountName(result),
      }));
    });

    const characters = models.Gw2Character.findAll({
      where: {
        showPublic: true,
        name: {
          $like: `%${term}%`,
        },
      },
      include: [{
        model: models.Gw2ApiToken,
        include: models.User,
      }],
    })
    .then((results) => {
      return results.map((result) => {
        return {
          resource: 'characters',
          name: result.name,
          alias: result.Gw2ApiToken.User.alias,
          accountName: result.Gw2ApiToken.accountName,
          profession: result.profession,
          level: result.level,
          race: result.race,
        };
      });
    });

    const guilds = models.Gw2Guild.findAll({
      where: {
        name: {
          $like: `%${term}%`,
        },
      },
    })
    .then((results) => {
      return results.map((result) => {
        return {
          resource: 'guilds',
          name: result.name,
          tag: result.tag,
        };
      });
    });

    return Promise.all([users, characters, guilds])
      .then((results) => {
        let mapped = [];

        results.forEach((result) => {
          mapped = mapped.concat(result);
        });

        return mapped;
      });
  }

  return {
    search,
  };
}

module.exports = controller;
