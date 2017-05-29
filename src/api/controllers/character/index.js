// @flow

import type { Models } from 'flowTypes';
import type { UpdateFields as Character$UpdateProperties } from 'lib/services/character';

import _ from 'lodash';
import memoize from 'memoizee';

import { tryFetch } from 'lib/services/fetch';
import config from 'config';
import gw2 from 'lib/gw2';

import {
  read as readCharacter,
  list as listCharacters,
  update as updateCharacter,
  listPublic,
  setPrivacy as setPrivacyCharacter,
  removePrivacy as removePrivacyCharacter,
} from 'lib/services/character';

import { read as readGuild } from 'lib/services/guild';

import { limit } from 'lib/math';

export default function characterControllerFactory (models: Models) {
  type ReadOptions = {
    email: string,
  };

  async function read (name: string, { email }: ReadOptions = {}) {
    const character = await readCharacter(models, name, email);
    if (!character) {
      throw new Error('Character not found');
    }

    tryFetch(models, character.Gw2ApiToken.id);

    let characterFromGw2Api;
    try {
      characterFromGw2Api = await gw2.readCharacter(character.Gw2ApiToken.token, name);
      characterFromGw2Api.apiTokenAvailable = true;
    } catch (e) {
      characterFromGw2Api = {
        apiTokenAvailable: false,
      };
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
  };

  async function list ({ email, alias }: ListOptions) {
    return await listCharacters(models, { email, alias });
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

  // TODO: If we ever scale this will have to be persisted to the database.
  const charactersOfTheDay = memoize(() => random(config.ofTheDay.characters), {
    maxAge: config.cache.resourceOfTheDay,
    promise: true,
    preFetch: true,
  });

  async function update (email: string, fields: Character$UpdateProperties) {
    const character = await readCharacter(models, fields.name, email);
    if (!character) {
      return Promise.reject(new Error('Not your character'));
    }

    return await updateCharacter(models, character.id, fields);
  }

  async function setPrivacy (name: string, email: string, privacy: string) {
    const character = await readCharacter(models, name, email);
    if (!character) {
      return Promise.reject(new Error('Not your character'));
    }

    return setPrivacyCharacter(models, name, privacy);
  }

  async function removePrivacy (name: string, email: string, privacy: string) {
    const character = await readCharacter(models, name, email);
    if (!character) {
      return Promise.reject(new Error('Not your character'));
    }

    return removePrivacyCharacter(models, name, privacy);
  }

  return {
    read,
    list,
    random,
    charactersOfTheDay,
    update,
    setPrivacy,
    removePrivacy,
  };
}
