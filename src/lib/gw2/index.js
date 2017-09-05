// @flow

import type { PvpSeason } from 'flowTypes';

import { setTokenValidity } from 'lib/services/fetch';
import memoize from 'memoizee';
import _ from 'lodash';
import axios from 'axios';
import config from 'config';

const normaliseObject = (data) => {
  return _.reduce(data, (obj, value, key) => ({
    ...obj,
    [_.camelCase(key)]: value,
  }), {});
};

const buildUrl = (endpoint, id, params) => {
  let url = endpoint.replace('{id}', id);

  _.forEach(params, (value, key) => {
    url = url.replace(`{${key}}`, value);
  });

  return url;
};

const filterEmptyItems = (response) => {
  return Array.isArray(response) ? response.filter((item) => !!item) : response;
};

const simpleCalls = _.reduce({
  readPvpGames: {
    resource: 'pvp/games',
    onSuccess: (token, result) => {
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
  readBank: { resource: 'account/bank' },
  readInventory: { resource: 'account/inventory' },
  readMaterials: { resource: 'account/materials' },
  readWallet: { resource: 'account/wallet' },
  readDungeons: { resource: 'account/dungeons' },
  readDyes: { resource: 'account/dyes' },
  readFinishers: { resource: 'account/finishers' },
  readMasteries: { resource: 'account/masteries' },
  readMinis: { resource: 'account/minis' },
  readOutfits: { resource: 'account/outfits' },
  readRaids: { resource: 'account/raids' },
  readRecipes: { resource: 'account/recipes' },
  readSkins: { resource: 'account/skins' },
  readTitles: { resource: 'account/titles' },
  readCats: { resource: 'account/home/cats' },
  readNodes: { resource: 'account/home/nodes' },
  readPvpLadder: {
    resource: 'pvp/seasons/{id}/leaderboards/ladder/{region}?page_size=200{page}',
    noAuth: true,
    // TODO: Add proper pagination for endpoints. THIS_IS_NASTY.
    onSuccess: async (token, response, id, params) => {
      if (params.page) {
        return response;
      }

      const moreStandings = await simpleCalls.readPvpLadder(null, id, {
        ...params,
        page: '&page=1',
      });

      return { data: response.data.concat(moreStandings) };
    },
  },
}, (obj, { resource, onSuccess, normalise, noAuth, filterUndefined }, key) => {
  const func = async (token, idd, paramss) => {
    const id = idd || '';
    const params = paramss || {};

    const url = buildUrl(`${config.gw2.endpoint}v2/${resource}`, id, params);
    const response = await setTokenValidity(axios.get(url, !noAuth && {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }), token);

    let data = response.data;

    if (onSuccess) {
      const nextResponse = await onSuccess(token, response, id, params);
      data = nextResponse.data;
    }

    if (normalise) {
      data = normaliseObject(data);
    }

    data = filterEmptyItems(data);

    return data;
  };

  return {
    ...obj,
    // TODO: If we ever scale out this will have to be moved to redis.
    [key]: memoize(func, {
      maxAge: config.cache.gw2Api,
      promise: true,
      preFetch: true,
    }),
  };
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

async function getLatestPvpSeason (lang: string): Promise<PvpSeason> {
  try {
    const { data: seasons } = await axios
      .get(`${config.gw2.endpoint}v2/pvp/seasons?page=0&page_size=200&lang=${lang}`);

    const sortedSeasons = seasons.sort((a, b) => {
      const aStart = new Date(a.start);
      const bStart = new Date(b.start);

      if (aStart < bStart) {
        return -1;
      }

      if (aStart > bStart) {
        return 1;
      }

      return 0;
    });

    const latestSeason = _.last(sortedSeasons);
    return latestSeason;
  } catch (e) {
    return {
      id: config.leaderboards.backupLatestSeasonId,
      name: 'Pvp Season Data Currently Unavailable',
    };
  }
}

export const readLatestPvpSeason: (lang: string) =>
  Promise<PvpSeason> = memoize(getLatestPvpSeason, {
    maxAge: config.leaderboards.latestSeasonCacheTtl,
    promise: true,
    preFetch: true,
    length: 1,
  });

export default {
  ...simpleCalls,
  readLatestPvpSeason,
  readTokenInfoWithAccount,
  readGuildPublic,
};
