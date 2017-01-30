// @flow

import type { Models } from 'flowTypes';
import _ from 'lodash';

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
  });
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
  ]);

  return {
    ...data,
    claimed: !!guild.apiTokenId,
  };
}

export async function list (models: Models) {
  return await models.Gw2Guild.findAll();
}

export async function isAccessAllowed (models: Models, type: string) {
  if (type === 'members') {
    return await Promise.resolve(true);
  }

  return await Promise.resolve(false);
}
