// @flow

import type { Models } from 'flowTypes';

import _ from 'lodash';
import memoize from 'memoizee';

import config from 'config';
import { readCharacter } from 'lib/gw2';
import { list as listCharacters, listPublic } from 'lib/services/character';
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
    const query = {
      include: [{
        model: models.Gw2ApiToken,
        include: [{
          model: models.User,
        }],
      }],
      where: {
        name,
      },
    };

    if (email) {
      query.include[0].include = [{
        model: models.User,
        where: {
          email,
        },
      }];
    }

    const character = await models.Gw2Character.findOne(query);
    if (!character ||
      (!character.showPublic && !canIgnorePrivacy(character, email, ignorePrivacy))) {
      return Promise.reject();
    }

    const characterFromGw2Api = await readCharacter(character.Gw2ApiTokenToken, name);
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

    const guild = await models.Gw2Guild.findOne({
      where: {
        id: character.guild,
      },
    });

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

  const findAllCharacters = memoize(() => console.log('\n=== Reading chars ===\n') ||
  listPublic(models), {
    maxAge: config.cache.findAllCharacters,
    promise: true,
    preFetch: true,
  });

  async function random (n: number = 1) {
    const characters = await findAllCharacters();
    if (!characters.length) {
      return undefined;
    }

    return _.sampleSize(characters, limit(n, 10)).map((character) => character.name);
  }

  type UpdateOptions = {
    name: string,
    showPublic: boolean,
    showBuilds: boolean,
    showPvp: boolean,
    showBags: boolean,
    showGuild: boolean,
  };

  async function update (email: string, {
    name,
    showPublic,
    showBuilds,
    showPvp,
    showBags,
    showGuild,
  }: UpdateOptions) {
    const character = await models.Gw2Character.findOne({
      where: {
        name,
      },
      include: [{
        model: models.Gw2ApiToken,
        include: [{
          model: models.User,
          where: {
            email,
          },
        }],
      }],
    });

    if (!character) {
      return Promise.reject('Not your character');
    }

    return await models.Gw2Character.update({
      showPublic,
      showBuilds,
      showPvp,
      showBags,
      showGuild,
    }, {
      where: {
        id: character.dataValues.id,
      },
    });
  }

  return {
    read,
    list,
    random,
    update,
  };
}
