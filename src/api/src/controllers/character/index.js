const memoize = require('memoizee');
const config = require('../../../env');

function characterControllerFactory (models, gw2Api) {
  function read (name, ignorePrivacy, email) {
    let characterFromDb;

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
      .then((result) => {
        if (!result) {
          return Promise.reject();
        }

        characterFromDb = result;

        return {
          name,
          token: result.Gw2ApiTokenToken,
          showCrafting: result.showCrafting,
          showBags: result.showBags,
          showEquipment: result.showEquipment,
          showBuilds: result.showBuilds,
          showPvp: result.showPvp,
          showGuild: result.showGuild,
          showPublic: result.showPublic,
        };
      })
      .then((data) => {
        return gw2Api.readCharacter(data.name, {
          token: data.token,
          showBags: ignorePrivacy || data.showBags,
          showCrafting: ignorePrivacy || data.showCrafting,
          showEquipment: ignorePrivacy || data.showEquipment,
          showBuilds: ignorePrivacy || data.showBuilds,
        });
      })
      .then((data) => {
        if (data === 1) {
          return undefined;
        }

        const character = Object.assign({}, data);
        character.authorization = {
          showPublic: characterFromDb.showPublic,
          showGuild: characterFromDb.showGuild,
        };

        character.accountName = characterFromDb.Gw2ApiToken.accountName;
        character.alias = characterFromDb.Gw2ApiToken.User.alias;

        if (!characterFromDb.guild) {
          return character;
        }

        return models.Gw2Guild.findOne({
          where: {
            id: characterFromDb.guild,
          },
        })
        .then((guild) => {
          if (!guild) {
            return character;
          }

          character.guild_tag = guild.tag;
          character.guild_name = guild.name;

          return character;
        });
      });
  }

  function list (email, alias) {
    const where = {};

    if (email) {
      where.email = email;
    }

    if (alias) {
      where.alias = alias;
    }

    return models
      .Gw2Character
      .findAll({
        include: [{
          model: models.Gw2ApiToken,
          include: [{
            model: models.User,
            where,
          }],
        }],
      })
      .then((characters) => {
        return characters.map((c) => {
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

  const findAllCharacters = memoize(() => models.Gw2Character.findAll(), {
    maxAge: config.cache.findAllCharacters,
    promise: true,
  });

  function random () {
    return findAllCharacters()
      .then((characters) => {
        if (!characters.length) {
          return undefined;
        }

        const randomIndex = Math.floor(Math.random() * characters.length);
        return characters[randomIndex].dataValues.name;
      });
  }

  return {
    read,
    list,
    random,
  };
}

module.exports = characterControllerFactory;
