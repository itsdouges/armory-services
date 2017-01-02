const memoize = require('memoizee');
const config = require('config');
const _ = require('lodash');
const limit = require('lib/math').limit;

function canIgnorePrivacy (character, email, ignorePrivacy) {
  return ignorePrivacy && email === character.Gw2ApiToken.User.email;
}

function characterControllerFactory (models, gw2Api) {
  function read (name, { ignorePrivacy, email } = {}) {
    const query = {
      include: [{
        model: models.Gw2ApiToken,
        include: [{
          model: models.User,
        }],
      }],
      where: {
        name,
      },
    };

    if (email) {
      query.include[0].include = [{
        model: models.User,
        where: {
          email,
        },
      }];
    }

    return models
      .Gw2Character
      .findOne(query)
      .then((character) => {
        if (!character ||
          (!character.showPublic && !canIgnorePrivacy(character, email, ignorePrivacy))) {
          return Promise.reject();
        }

        return gw2Api.readCharacter(character.Gw2ApiTokenToken, name)
          .then((data) => {
            if (data === 1) {
              return undefined;
            }

            const characterResponse = Object.assign({}, data, {
              accountName: character.Gw2ApiToken.accountName,
              alias: character.Gw2ApiToken.User.alias,
              authorization: {
                showPublic: character.showPublic,
                showGuild: character.showGuild,
              },
            });

            if (!character.guild) {
              return characterResponse;
            }

            return models.Gw2Guild.findOne({
              where: {
                id: character.guild,
              },
            })
            .then((guild) => {
              if (!guild) {
                return characterResponse;
              }

              return Object.assign({}, characterResponse, {
                guild_tag: guild.tag,
                guild_name: guild.name,
              });
            });
          });
      });
  }

  function list ({ email, alias, ignorePrivacy }) {
    const userWhere = Object.assign({},
      email && { email },
      alias && { alias }
    );

    return models
      .Gw2Character
      .findAll({
        include: [{
          model: models.Gw2ApiToken,
          include: [{
            model: models.User,
            where: userWhere,
          }],
        }],
      })
      .then((characters) => {
        return characters
          .filter((character) => (
            character.showPublic || canIgnorePrivacy(character, email, ignorePrivacy))
          )
          .map((c) => {
            return {
              accountName: c.Gw2ApiToken.accountName,
              world: c.Gw2ApiToken.world,
              name: c.name,
              gender: c.gender,
              profession: c.profession,
              level: c.level,
              race: c.race,
            };
          });
      });
  }

  const findAllCharacters = memoize(() => console.log('\n=== Reading chars ===\n') ||
  models.Gw2Character.findAll({
    where: {
      showPublic: true,
    },
  }), {
    maxAge: config.cache.findAllCharacters,
    promise: true,
    preFetch: true,
  });

  function random (n = 1) {
    return findAllCharacters()
      .then((characters) => {
        if (!characters.length) {
          return undefined;
        }

        return _.sampleSize(characters, limit(n, 10)).map((character) => character.name);
      });
  }

  function update (email, {
    name,
    showPublic,
    showBuilds,
    showPvp,
    showBags,
    showGuild,
  }) {
    return models
      .Gw2Character
      .findOne({
        where: {
          name,
        },
        include: [{
          model: models.Gw2ApiToken,
          include: [{
            model: models.User,
            where: {
              email,
            },
          }],
        }],
      })
    .then((character) => {
      if (!character) {
        return Promise.reject('Not your character');
      }

      return models.Gw2Character.update({
        showPublic,
        showBuilds,
        showPvp,
        showBags,
        showGuild,
      }, {
        where: {
          id: character.dataValues.id,
        },
      });
    });
  }

  return {
    read,
    list,
    random,
    update,
  };
}

module.exports = characterControllerFactory;
