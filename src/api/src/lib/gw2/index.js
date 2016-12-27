const _ = require('lodash');
const axios = require('axios');
const config = require('../../../config');

function normaliseObject (data) {
  return _.reduce(data, (obj, value, key) => {
    // eslint-disable-next-line
    obj[_.camelCase(key)] = value;
    return obj;
  }, {});
}

function addExtra (endpoint, id) {
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
  readCharacters: { resource: 'characters' },
  readCharacter: { resource: 'characters/{id}' },
  readAchievements: { resource: 'account/achievements' },
}, (obj, { resource, onResult, normalise }, key) => {
  // eslint-disable-next-line
  obj[key] = (token, id = '') => axios.get(addExtra(`${config.gw2.endpoint}v2/${resource}`, id), {
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

module.exports = {
  ...simpleCalls,
  readTokenInfoWithAccount,
};
