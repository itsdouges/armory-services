// @flow

import type { PvpSeason } from 'flowTypes';

import _ from 'lodash';
import axios from 'axios';
import config from 'config';
import retryFactory from 'lib/retry';

const withRetry = retryFactory({ retryPredicate: (e) => (e.status >= 500) });

function normaliseObject (data) {
  return _.reduce(data, (obj, value, key) => {
    // eslint-disable-next-line
    obj[_.camelCase(key)] = value;
    return obj;
  }, {});
}

function replaceId (endpoint, id) {
  if (id) {
    return endpoint.replace('{id}', id);
  }

  return endpoint;
}

const simpleCalls = _.reduce({
  readPvpGames: { resource: 'pvp/games',
    onResult: (token, result) => {
      const ids = result.data.join(',');
      if (!ids) {
        return result;
      }

      return axios.get(`${config.gw2.endpoint}v2/pvp/games?ids=${ids}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
  readGuild: { resource: 'guild/{id}' },
  readGuildLogs: { resource: 'guild/{id}/log' },
  readGuildMembers: { resource: 'guild/{id}/members' },
  readGuildRanks: { resource: 'guild/{id}/ranks' },
  readGuildStash: { resource: 'guild/{id}/stash' },
  readGuildTreasury: { resource: 'guild/{id}/treasury' },
  readGuildTeams: { resource: 'guild/{id}/teams' },
  readGuildUpgrades: { resource: 'guild/{id}/upgrades' },
  readPvpStandings: { resource: 'pvp/standings' },
  readPvpStats: { resource: 'pvp/stats' },
  readAccount: { resource: 'account', normalise: true },
  readTokenInfo: { resource: 'tokeninfo' },
  readCharacter: { resource: 'characters/{id}' },
  readCharacters: { resource: 'characters' },
  readCharactersDeep: { resource: 'characters?page=0&page_size=200' },
  readAchievements: { resource: 'account/achievements' },
}, (obj, { resource, onResult, normalise }, key) => {
  // eslint-disable-next-line max-len
  const func = (token, id = '') => axios.get(replaceId(`${config.gw2.endpoint}v2/${resource}`, id), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((result) => {
    if (onResult) {
      return onResult(token, result);
    }

    return result;
  })
  .then(({ data }) => {
    if (normalise) {
      return normaliseObject(data);
    }

    return data;
  });

  // eslint-disable-next-line
  obj[key] = withRetry(func);

  return obj;
}, {});

function readTokenInfoWithAccount (token) {
  const accountPromise = simpleCalls.readAccount(token);
  const infoPromise = simpleCalls.readTokenInfo(token);

  return Promise.all([accountPromise, infoPromise])
    .then(([acc, info]) => ({
      info: info.permissions,
      world: acc.world,
      accountId: acc.id,
      accountName: acc.name,
    }));
}

function readGuildPublic (id) {
  return axios.get(`${config.gw2.endpoint}v1/guild_details.json?guild_id=${id}`)
    .then(({ data }) => data);
}

export async function readPvpSeason (id: number) {
  const response = await axios.get(`${config.gw2.endpoint}v2/pvp/seasons/${id}`);
  return response.data;
}

export async function readLatestPvpSeason (): Promise<PvpSeason> {
  const { data: seasons } = await axios
    .get(`${config.gw2.endpoint}v2/pvp/seasons?page=0&page_size=200`);

  const sortedSeasons = seasons.sort((a, b) => {
    const aStart = new Date(a.start);
    const bStart = new Date(b.start);

    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0;
  });

  const latestSeason = _.last(sortedSeasons);
  return latestSeason;
}

export default {
  ...simpleCalls,
  readTokenInfoWithAccount,
  readGuildPublic,
};
