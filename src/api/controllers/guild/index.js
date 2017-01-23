// @flow

import type { Models } from 'flowTypes';

import memoize from 'memoizee';
import _ from 'lodash';

import config from 'config';
import { limit } from 'lib/math';
import {
  read as readGuild,
  list as listGuilds,
  readPrivate as readGuildPrivate,
} from 'lib/services/guild';

import gw2 from 'lib/gw2';

import { list as listUsers } from 'lib/services/user';
import { list as listCharacters } from 'lib/services/character';
import { read as readToken } from 'lib/services/tokens';
import access from './access';

const guildMethodMap = {
  logs: gw2.readGuildLogs,
  members: gw2.readGuildMembers,
  ranks: gw2.readGuildRanks,
  stash: gw2.readGuildStash,
  treasury: gw2.readGuildTreasury,
  teams: gw2.readGuildTeams,
  upgrades: gw2.readGuildUpgrades,
};

export default function guildControllerFactory (models: Models) {
  const checkAccess = (type, guildName, email) => access(models, { type, guildName, email });

  async function read (name, { email } = {}) {
    const guild = await readGuild(models, { name });

    const [canAccess, characters, users] = await Promise.all([
      checkAccess('read', name, email),
      listCharacters(models, { guild: guild && guild.id }),
      listUsers(models, { guild: guild && guild.id }),
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

  async function readGuildWithAccess (name, accessType, { email } = {}) {
    const canAccess = await checkAccess(accessType, name, email);
    if (!canAccess) {
      return undefined;
    }

    const guild = await readGuildPrivate(models, { name });
    if (!guild.apiTokenId) {
      return undefined;
    }

    return guild;
  }

  const guildMethods = _.reduce(guildMethodMap, (obj, func, methodName) => {
    // eslint-disable-next-line no-param-reassign
    obj[methodName] = async (name, { email } = {}) => {
      const guild = await readGuildWithAccess(name, methodName, { email });
      if (!guild) {
        return [];
      }

      const token = await readToken(models, { id: guild.apiTokenId });

      return await func(token.token, guild.id);
    };

    return obj;
  }, {});

  return {
    read,
    random,
    ...guildMethods,
  };
}
