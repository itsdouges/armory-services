const memoize = require('memoizee');
const config = require('../../../config');
const _ = require('lodash');
const limit = require('../../lib/math').limit;

function guildControllerFactory (models) {
  function read (name) {
    return models.Gw2Guild.findOne({
      where: {
        name,
      },
    })
    .then((guild) => {
      if (!guild) {
        return undefined;
      }

      return {
        name: guild.name,
        id: guild.id,
        tag: guild.tag,
        claimed: !!guild.apiToken,
      };
    })
    .then((guild) => {
      const characters = models.Gw2Character.findAll({
        where: {
          guild: guild.id,
        },
        include: [{
          model: models.Gw2ApiToken,
          include: [{
            model: models.User,
          }],
        }],
      });

      const tokens = models.Gw2ApiToken.findAll({
        where: {
          guilds: {
            $like: `%${guild.id}%`,
          },
        },
        include: [{
          model: models.User,
        }],
      });

      return Promise.all([guild, characters, tokens]);
    })
    .then(([guild, characters, tokens]) => {
      return Object.assign({}, guild, {
        characters: characters.map((c) => ({
          world: 'world',
          name: c.name,
          gender: c.gender,
          profession: c.profession,
          level: c.level,
          race: c.race,
          userAlias: c.Gw2ApiToken.User.alias,
          accountName: c.Gw2ApiToken.accountName,
        })),
      }, {
        users: tokens.map((token) => ({
          name: token.User.alias,
          accountName: token.accountName,
        })),
      });
    });
  }

  const findAllGuilds = memoize(() => console.log('\n=== Reading guilds ===\n') ||
  models.Gw2Guild.findAll(), {
    maxAge: config.cache.findAllCharacters,
    promise: true,
    preFetch: true,
  });

  function random (n = 1) {
    return findAllGuilds()
      .then((guilds) => {
        if (!guilds.length) {
          return undefined;
        }

        return _.sampleSize(guilds, limit(n, 10)).map((guild) => ({
          name: guild.name,
          id: guild.id,
          tag: guild.tag,
        }));
      });
  }

  return {
    read,
    random,
  };
}

module.exports = guildControllerFactory;
