// @flow

import type { Models } from 'flowTypes';

import { notFound } from 'lib/errors';
import _ from 'lodash';
import {
  setPrivacy as setPrivacyGeneric,
  removePrivacy as removePrivacyGeneric,
  hasPrivacy as hasPrivacyGeneric,
} from './generic';

type Guild$Read = {
  id?: string,
  name?: string,
};

export async function readPrivate (models: Models, { id, name }: Guild$Read) {
  return await models.Gw2Guild.findOne({
    where: _.pickBy({
      id,
      name,
    }),
    raw: true,
    include: [{
      model: models.Gw2ApiToken,
      include: models.User,
    }],
  });
}

export async function isGuildLeader (models: Models, email: string, guildName: string) {
  const guild = await readPrivate(models, { name: guildName });
  if (!guild) {
    throw notFound();
  }

  return guild['Gw2ApiToken.User.email'] === email;
}

export async function read (models: Models, { id, name }: Guild$Read) {
  const guild = await readPrivate(models, { id, name });
  if (!guild) {
    return undefined;
  }

  const data = _.pick(guild, [
    'id',
    'tag',
    'name',
    'motd',
    'level',
    'influence',
    'aetherium',
    'resonance',
    'favor',
    'apiTokenId',
  ]);

  return {
    ...data,
    claimed: !!guild.apiTokenId,
    privacy: (guild.privacy || '').split('|').filter(Boolean),
    leader: guild['Gw2ApiToken.User.alias'] && {
      alias: guild['Gw2ApiToken.User.alias'],
      accountName: guild['Gw2ApiToken.accountName'],
    },
  };
}

export async function list (models: Models) {
  return await models.Gw2Guild.findAll();
}

export async function setPrivacy (models: Models, name: string, privacy: string) {
  return setPrivacyGeneric(models.Gw2Guild, privacy, {
    key: 'name',
    value: name,
  });
}

export async function removePrivacy (models: Models, name: string, privacy: string) {
  return removePrivacyGeneric(models.Gw2Guild, privacy, {
    key: 'name',
    value: name,
  });
}

export async function hasPrivacy (models: Models, name: string, privacy: string) {
  return hasPrivacyGeneric(models.Gw2Guild, privacy, {
    key: 'name',
    value: name,
  });
}

const FORCE_ALLOWED_LIST = [
  'members',
];

export async function isAccessAllowed (models: Models, type: string, guildName: string) {
  if (FORCE_ALLOWED_LIST.includes(type)) {
    return true;
  }

  const isAllowed = await hasPrivacy(models, guildName, type);
  return isAllowed;
}
