// @flow

import type { Models, PaginatedResponse, CharacterSimple } from 'flowTypes';
import _ from 'lodash';
import {
  setPrivacy as setPrivacyGeneric,
  removePrivacy as removePrivacyGeneric,
  hasPrivacy as hasPrivacyGeneric,
} from './generic';

function canIgnorePrivacy (character, email) {
  return email === character.Gw2ApiToken.User.email;
}

type ListOptions = {
  email?: string,
  alias?: string,
  guild?: string,
  limit?: number,
  offset?: number,
};

export async function list (models: Models, {
  email,
  alias,
  guild,
  limit,
  offset,
}: ListOptions): Promise<PaginatedResponse<CharacterSimple>> {
  const { rows, count } = await models.Gw2Character.findAndCount({
    limit,
    offset,
    where: _.pickBy({
      guild,
    }),
    include: [{
      model: models.Gw2ApiToken,
      include: [{
        model: models.User,
        where: _.pickBy({
          // We only want to search with one prop.
          email: alias && email ? undefined : email,
          alias,
        }),
      }],
    }],
  });

  const characters = rows.filter((character) => (
    character.showPublic || canIgnorePrivacy(character, email))
  )
  .map((c) => {
    return {
      accountName: c.Gw2ApiToken.accountName,
      userAlias: c.Gw2ApiToken.User.alias,
      world: c.Gw2ApiToken.world,
      name: c.name,
      gender: c.gender,
      profession: c.profession,
      level: c.level,
      race: c.race,
    };
  });

  return {
    rows: characters,
    count,
    limit: limit || count,
    offset: offset || 0,
  };
}

export async function listPublic (models: Models) {
  return models.Gw2Character.findAll({
    where: {
      showPublic: true,
    },
  });
}

export async function read (models: Models, name: string, email?: string) {
  const character = await models.Gw2Character.findOne({
    include: [{
      model: models.Gw2ApiToken,
      include: [{
        model: models.User,
      }],
    }],
    where: {
      name,
    },
  });

  return (character && (character.showPublic || canIgnorePrivacy(character, email)))
    ? character
    : undefined;
}

export type UpdateFields = {
  name: string,
  showPublic: boolean,
  showBuilds: boolean,
  showPvp: boolean,
  showBags: boolean,
  showGuild: boolean,
};

export async function update (models: Models, id: number, fields: UpdateFields) {
  return await models.Gw2Character.update(fields, {
    where: {
      id,
    },
  });
}

export async function setPrivacy (models: Models, name: string, privacy: string) {
  return setPrivacyGeneric(models.Gw2Character, privacy, {
    key: 'name',
    value: name,
  });
}

export async function removePrivacy (models: Models, name: string, privacy: string) {
  return removePrivacyGeneric(models.Gw2Character, privacy, {
    key: 'name',
    value: name,
  });
}

export async function hasPrivacy (models: Models, name: string, privacy: string) {
  return hasPrivacyGeneric(models.Gw2Character, privacy, {
    key: 'name',
    value: name,
  });
}
