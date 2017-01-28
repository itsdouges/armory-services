/* eslint no-param-reassign:0 */

export default function statisticsControllerFactory (models) {
  function extractData (chars, name) {
    return chars.reduce((genders, char) => {
      if (genders[char[name]]) {
        genders[char[name]] += 1;
      } else {
        genders[char[name]] = 1;
      }

      return genders;
    }, {});
  }

  function extractGuilds (chars) {
    return chars.reduce((glds, char) => {
      if (char.guild) {
        glds.yes += 1;
      } else {
        glds.no += 1;
      }

      return glds;
    }, { yes: 0, no: 0 });
  }

  async function users () {
    const stubUsers = await models.User.findAll({
      where: {
        stub: true,
      },
    });

    const realUsers = await models.User.findAll({
      where: {
        stub: false,
      },
    });

    return {
      unclaimed: stubUsers.length,
      claimed: realUsers.length,
      total: stubUsers.length + realUsers.length,
    };
  }

  async function guilds () {
    return models.Gw2Guild.findAll()
      .then((glds) => {
        return {
          count: glds.length,
        };
      });
  }

  async function characters () {
    const chars = await models.Gw2Character.findAll();

    return {
      race: extractData(chars, 'race'),
      gender: extractData(chars, 'gender'),
      profession: extractData(chars, 'profession'),
      level: extractData(chars, 'level'),
      guild: extractGuilds(chars),
      count: chars.length,
    };
  }

  return {
    users,
    guilds,
    characters,
  };
}
