/* eslint no-param-reassign:0 */

module.exports = (models) => {
  function users () {
    return models.User.findAll()
      .then((usrs) => {
        return {
          count: usrs.length,
        };
      });
  }

  function guilds () {
    return models.Gw2Guild.findAll()
      .then((glds) => {
        return {
          count: glds.length,
        };
      });
  }

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

  function characters () {
    return models.Gw2Character.findAll()
      .then((chars) => {
        return {
          race: extractData(chars, 'race'),
          gender: extractData(chars, 'gender'),
          profession: extractData(chars, 'profession'),
          level: extractData(chars, 'level'),
          guild: extractGuilds(chars),
          count: chars.length,
        };
      });
  }

  return {
    users,
    guilds,
    characters,
  };
};
