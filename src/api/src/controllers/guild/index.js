import memoize from 'memoizee';
import _ from 'lodash';

import config from '../../../config';
import { limit } from '../../lib/math';
import {
  read as readGuild,
  list as listGuilds,
} from '../../services/guild';

import { list as listCharacters } from '../../services/character';
import { list as listUsers } from '../../services/user';
import access from './access';

export default function guildControllerFactory (models) {
  const checkAccess = (type, guildName, email) => access(models, { type, guildName, email });

  async function read (name, { email } = {}) {
    const guild = await readGuild(models, { name });

    const [canAccess, characters, users] = await Promise.all([
      checkAccess('read', name, email),
      listCharacters(models, { guild: guild.id }),
      listUsers(models, { guild: guild.id }),
    ]);

    const parsedGuild = canAccess ? guild : _.pick(guild, [
      'name',
      'id',
      'tag',
      'claimed',
    ]);

    return {
      ...parsedGuild,
      characters,
      users,
    };
  }

  const findAllGuilds = memoize(
    () => console.log('\n=== Reading guilds ===\n') ||
    listGuilds(models), {
      maxAge: config.cache.findAllCharacters,
      promise: true,
      preFetch: true,
    }
  );

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
