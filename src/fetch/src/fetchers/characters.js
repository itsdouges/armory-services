const q = require('q');
const unique = require('lodash/uniq');

const gw2Fetch = require('../lib/gw2');

module.exports = function fetchUserCharacterData (models, token) {
  return gw2Fetch
    .characters(token)
    .then((characters) => {
      return models.Gw2Character.destroy({
        where: {
          Gw2ApiTokenToken: token,
          name: {
            $notIn: characters.map(({ name }) => name),
          },
        },
      })
      .then(() => {
        const guildIds = characters
          .map((character) => character.guild)
          .filter((guildId) => !!guildId);

        const createGuildPromises = unique(guildIds)
          .reduce((promises, guildId) => {
            const promise = models.Gw2Guild.findOne({
              where: {
                id: guildId,
              },
            })
            .then((guild) => !guild && gw2Fetch.guild(guildId))
            .then((guild) => {
              return guild && models.Gw2Guild.create({
                id: guild.guild_id,
                name: guild.guild_name,
                tag: guild.tag,
              });
            });

            promises.push(promise);

            return promises;
          }, []);

        const upsertCharactersPromises = characters.reduce((promises, char) => {
          const findAndInsertOrUpdate = models.Gw2Character
            .findOne({ where: { name: char.name, Gw2ApiTokenToken: token } })
            .then((character) => {
              return models.Gw2Character
                .upsert({
                  id: character && character.id,
                  name: char.name,
                  race: char.race,
                  gender: char.gender,
                  profession: char.profession,
                  level: char.level,
                  guild: char.guild,
                  created: char.created,
                  age: char.age,
                  deaths: char.deaths,
                  Gw2ApiTokenToken: token,
                });
            });

          promises.push(findAndInsertOrUpdate);

          return promises;
        }, []);

        return q.allSettled([...createGuildPromises, ...upsertCharactersPromises])
          .then((results) => {
            const errors = results.filter((result) => result.state === 'rejected');
            if (errors.length) {
              throw errors;
            }
          });
      });
    })
    .catch((response) => {
      // eslint-disable-next-line
      console.error(`\n=== Error fetching characters with ${token} @ ${new Date().toGMTString()} === \n`);
      console.error(response);

      return q.reject(response);
    });
};
