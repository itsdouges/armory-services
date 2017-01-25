// @flow

import type { Models } from 'flowTypes';
import type { UpdateFields as Character$UpdateProperties } from 'lib/services/character';

import _ from 'lodash';
import memoize from 'memoizee';

import config from 'config';
import gw2 from 'lib/gw2';

import {
  read as readCharacter,
  list as listCharacters,
  update as updateCharacter,
  listPublic,
} from 'lib/services/character';

import { read as readGuild } from 'lib/services/guild';

import { limit } from 'lib/math';

function canIgnorePrivacy (character, email, ignorePrivacy) {
  return ignorePrivacy && email === character.Gw2ApiToken.User.email;
}

export default function characterControllerFactory (models: Models) {
  type ReadOptions = {
    ignorePrivacy: boolean,
    email: string,
  };

  async function read (name: string, { ignorePrivacy, email }: ReadOptions = {}) {
    const character = await readCharacter(models, name, email);
    if (!character) {
      throw new Error('Character not found');
    }

    if (!character.showPublic && !canIgnorePrivacy(character, email, ignorePrivacy)) {
      return Promise.reject(new Error('Unauthorized to view character'));
    }

    const characterFromGw2Api = await gw2.readCharacter(character.Gw2ApiToken.token, name);
    if (characterFromGw2Api === 1) {
      return undefined;
    }

    const characterResponse = {
      ...characterFromGw2Api,
      accountName: character.Gw2ApiToken.accountName,
      alias: character.Gw2ApiToken.User.alias,
      authorization: {
        showPublic: character.showPublic,
        showGuild: character.showGuild,
      },
    };

    if (!character.guild) {
      return characterResponse;
    }

    const guild = await readGuild(models, { id: character.guild });
    if (!guild) {
      return characterResponse;
    }

    return {
      ...characterResponse,
      guild_tag: guild.tag,
      guild_name: guild.name,
    };
  }

  type ListOptions = {
    email?: string,
    alias?: string,
    ignorePrivacy: boolean,
  };

  async function list ({ email, alias, ignorePrivacy }: ListOptions) {
    return await listCharacters(models, { email, alias, ignorePrivacy });
  }

  const findAllCharacters = memoize(listPublic, {
    maxAge: config.cache.findAllCharacters,
    promise: true,
    preFetch: true,
  });

  async function random (n: number = 1) {
    const characters = await findAllCharacters(models);
    if (!characters.length) {
      return undefined;
    }

    return _.sampleSize(characters, limit(n, 10)).map((character) => character.name);
  }

  async function update (email: string, fields: Character$UpdateProperties) {
    const character = await readCharacter(models, fields.name, email);
    if (!character) {
      return Promise.reject(new Error('Not your character'));
    }

    return await updateCharacter(models, character.id, fields);
  }

  return {
    read,
    list,
    random,
    update,
  };
}
