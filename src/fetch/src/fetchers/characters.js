const q = require('q');
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
        const promises = [];

        characters.forEach((char) => {
          const promiseToAddCharacter = models
            .Gw2Character
            .upsert({
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

          promises.push(promiseToAddCharacter);

          if (!char.guild) {
            return;
          }

          const promiseToAddGuild = models.Gw2Guild.findOne({
            where: {
              name: char.guild,
            },
          })
          .then((guild) => {
            if (guild) {
              return undefined;
            }

            return gw2Fetch
              .guild(char.guild)
              .then((gld) => {
                return models.Gw2Guild.create({
                  id: gld.guild_id,
                  name: gld.guild_name,
                  tag: gld.tag,
                });
              });
          });

          promises.push(promiseToAddGuild);
        });

        return q.allSettled(promises);
      });
    })
    .catch((response) => {
      // eslint-disable-next-line
      console.error(`\n===Recieved ${response.status} during fetch @ ${new Date().toGMTString()} ===\n`);
      console.error(response);

      return q.reject(response);
    });
};
