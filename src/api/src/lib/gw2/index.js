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

function addExtra (endpoint, extra) {
  if (extra) {
    return `${endpoint}/${extra}`;
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
  readPvpStandings: { resource: 'pvp/standings' },
  readPvpStats: { resource: 'pvp/stats' },
  readAccount: { resource: 'account', normalise: true },
  readTokenInfo: { resource: 'tokeninfo' },
  readCharacters: { resource: 'characters' },
  readCharacter: { resource: 'characters' },
  readAchievements: { resource: 'account/achievements' },
}, (obj, { resource, onResult, normalise }, key) => {
  // eslint-disable-next-line
  obj[key] = (token, extra = '') => axios.get(addExtra(`${config.gw2.endpoint}v2/${resource}`, extra), {
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

module.exports = Object.assign({}, simpleCalls, { readTokenInfoWithAccount });
