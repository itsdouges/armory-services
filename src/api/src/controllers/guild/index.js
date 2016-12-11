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

export default function guildControllerFactory (models) {
  const checkAccess = require('./access').bind(null, models);

  function read (name, { requestingUser } = {}) {
    return checkAccess('read', requestingUser)
      .then((canAccess) => {
        return readGuild(models, { name })
          .then((guild) => {
            return Promise.all([
              guild,
              listCharacters(models, { guild: guild.id }),
              listUsers(models, { guild: guild.id }),
            ]);
          })
          .then(([guild, characters, users]) => {
            const parsedGuild = canAccess ? guild : _.pick(guild, [
              'name',
              'id',
              'tag',
            ]);

            return {
              ...parsedGuild,
              characters,
              users,
            };
          });
      });
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
