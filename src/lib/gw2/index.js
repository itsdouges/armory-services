// @flow

const _ = require('lodash');
const axios = require('axios');

const config = require('config');
const retryFactory = require('lib/retry');

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
  readPvpStandings: { resource: 'pvp/standings', normalise: true },
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

module.exports = {
  ...simpleCalls,
  readTokenInfoWithAccount,
  readGuildPublic,
};
