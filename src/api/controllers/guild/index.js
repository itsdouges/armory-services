// @flow

import type { Models } from 'flowTypes';

import memoize from 'memoizee';
import _ from 'lodash';

import { unauthorized } from 'lib/errors';
import config from 'config';
import { tryFetch } from 'lib/services/fetch';
import { limit as limitTo } from 'lib/math';
import {
  read as readGuild,
  list as listGuilds,
  readPrivate as readGuildPrivate,
  setPrivacy as setPrivacyGuild,
  removePrivacy as removePrivacyGuild,
  isGuildLeader,
} from 'lib/services/guild';

import gw2 from 'lib/gw2';

import { list as listUsers } from 'lib/services/user';
import { list as listCharacters } from 'lib/services/character';
import { read as readToken } from 'lib/services/tokens';
import access from './access';

type Params = {
  email?: string,
  limit?: number,
  offset?: number,
};

function allowPublicProps (guild, privacy) {
  return _.pick(guild, [
    'name',
    'id',
    'tag',
    'claimed',
    'leader',
    'privacy',
    ...guild.privacy,
  ]);
}

export default function guildControllerFactory (models: Models) {
  const checkAccess = (type, guildName, email) => access(models, { type, guildName, email });

  async function read (name, { email } = {}) {
    const [guild, canAccess] = await Promise.all([
      readGuild(models, { name }),
      checkAccess('read', name, email),
    ]);

    if (!guild) {
      throw new Error('No guild was found.');
    }

    guild.apiTokenId && tryFetch(models, guild.apiTokenId);

    const parsedGuild = canAccess ? guild : allowPublicProps(guild);
    return parsedGuild;
  }

  async function readUsers (name, { email, limit, offset }: Params = {}) {
    const guild = await read(name, { email });
    const users = await listUsers(models, { guild: guild && guild.id, limit, offset });
    return users;
  }

  async function readCharacters (name, { email, limit, offset }: Params = {}) {
    const guild = await read(name, { email });
    const characters = await listCharacters(models, { guild: guild && guild.id, limit, offset });
    return characters;
  }

  const findAllGuilds = memoize(listGuilds, {
    maxAge: config.cache.findAllCharacters,
    promise: true,
    preFetch: true,
  });

  async function random (n: number = 1) {
    const guilds = await findAllGuilds(models);
    if (!guilds.length) {
      return undefined;
    }

    return _.sampleSize(guilds, limitTo(n, 10)).map((guild) => ({
      name: guild.name,
      id: guild.id,
      tag: guild.tag,
    }));
  }

  // TODO: If we ever scale this will have to be persisted to the database.
  const guildsOfTheDay = memoize(() => random(config.ofTheDay.guilds), {
    maxAge: config.cache.resourceOfTheDay,
    promise: true,
    preFetch: true,
  });

  async function readGuildWithAccess (name, accessType, { email } = {}) {
    const canAccess = await checkAccess(accessType, name, email);
    if (!canAccess) {
      return undefined;
    }

    const guild = await readGuildPrivate(models, { name });
    if (!guild.apiTokenId) {
      return undefined;
    }

    tryFetch(models, guild.apiTokenId);

    return guild;
  }

  async function assertLeader (name: string, email: string) {
    const isLeader = await isGuildLeader(models, email, name);
    if (!isLeader) {
      throw unauthorized();
    }
  }

  async function setPublic (name: string, email: string, privacy: string) {
    await assertLeader(name, email);

    return setPrivacyGuild(models, name, privacy);
  }

  async function removePublic (name: string, email: string, privacy: string) {
    await assertLeader(name, email);

    return removePrivacyGuild(models, name, privacy);
  }

  const guildMethodMap = {
    logs: gw2.readGuildLogs,
    members: gw2.readGuildMembers,
    ranks: gw2.readGuildRanks,
    stash: gw2.readGuildStash,
    treasury: gw2.readGuildTreasury,
    teams: gw2.readGuildTeams,
    upgrades: gw2.readGuildUpgrades,
  };

  const guildMethods = _.reduce(guildMethodMap, (obj, func, methodName) => {
    return {
      ...obj,
      [methodName]: async (name, { email } = {}) => {
        const guild = await readGuildWithAccess(name, methodName, { email });
        if (!guild) {
          return [];
        }

        const token = await readToken(models, { id: guild.apiTokenId });

        return await func(token.token, guild.id);
      },
    };
  }, {});

  return {
    read,
    setPublic,
    removePublic,
    random,
    guildsOfTheDay,
    readCharacters,
    readUsers,
    ...guildMethods,
  };
}
