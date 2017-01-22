import { allSettled } from 'lib/promise';
import gw2 from 'lib/gw2';

export default async function fetchUserCharacterData (models, { token, id }) {
  const characters = await gw2.readCharactersDeep(token);

  await models.Gw2Character.destroy({
    where: {
      Gw2ApiTokenId: id,
      name: {
        $notIn: characters.map(({ name }) => name),
      },
    },
  });

  const upsertCharactersPromises = characters.reduce((promises, char) => {
    const promise = models.Gw2Character.findOne({
      where: {
        name: char.name,
        Gw2ApiTokenId: id,
      },
    })
    .then((character) => {
      return models.Gw2Character.upsert({
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
        Gw2ApiTokenId: id,
      });
    });

    promises.push(promise);
    return promises;
  }, []);

  return await allSettled(upsertCharactersPromises);
}
