const config = require('../../config');
const axios = require('axios');
const retryFactory = require('./retry');
const _ = require('lodash');

const withRetry = retryFactory({ retryPredicate: (e) => (e.status >= 500) });

// TODO: use lib/gw2 from api.......!

function normaliseObject (data) {
  return _.reduce(data, (obj, value, key) => {
    // eslint-disable-next-line
    obj[_.camelCase(key)] = value;
    return obj;
  }, {});
}

export function guild (id) {
  return axios.get(`${config.gw2.endpoint}v1/guild_details.json?guild_id=${id}`)
    .then(({ data }) => data);
}

export function account (token) {
  return axios.get(`${config.gw2.endpoint}v2/account`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(({ data }) => normaliseObject(data));
}

export function guildLogs (token, id) {
  return axios.get(`${config.gw2.endpoint}v2/guild/${id}/logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(({ data }) => data);
}

export function guildAuthenticated (token, id) {
  return axios.get(`${config.gw2.endpoint}v2/guild/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(({ data }) => data);
}

export function guildMembers (token, id) {
  return axios.get(`${config.gw2.endpoint}v2/guild/${id}/members`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(({ data }) => data);
}

export function characters (token) {
  return axios.get(`${config.gw2.endpoint}v2/characters?page=0&page_size=200`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(({ data }) => data);
}

module.exports = {
  guild: withRetry(guild),
  characters: withRetry(characters),
  account: withRetry(account),
  guildAuthenticated: withRetry(guildAuthenticated),
  guildLogs,
  guildMembers,
};
