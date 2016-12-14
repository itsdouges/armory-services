const q = require('q');

const gw2Fetch = require('../lib/gw2');

module.exports = function fetchUserCharacterData (models, { token }) {
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

        return q.allSettled([...upsertCharactersPromises])
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
