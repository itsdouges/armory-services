// @flow

import type { Models } from 'flowTypes';
import type { Fetcher$Token } from 'fetch/tokenFetch';

import { allSettled } from 'lib/promise';
import gw2 from 'lib/gw2';

export default async function fetchUserCharacterData (
  models: Models,
  { token, id }: Fetcher$Token
) {
  const characters = await gw2.readCharactersDeep(token);

  await models.Gw2Character.destroy({
    where: {
      apiTokenId: id,
      name: {
        $notIn: characters.map(({ name }) => name),
      },
    },
  });

  const upsertCharactersPromises = characters.reduce((promises, char) => {
    const promise = models.Gw2Character.findOne({
      where: {
        name: char.name,
        apiTokenId: id,
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
        apiTokenId: id,
      });
    });

    promises.push(promise);
    return promises;
  }, []);

  return await allSettled(upsertCharactersPromises);
}
