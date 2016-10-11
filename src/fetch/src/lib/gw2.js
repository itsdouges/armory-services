const config = require('../../config');
const axios = require('axios');

function guild (id, retries) {
  if (retries === undefined) {
    // eslint-disable-next-line
    retries = 5;
  }

  return axios.get(`${config.gw2.endpoint}v1/guild_details.json?guild_id=${id}`)
    .then(({ data }) => data, (response) => {
      if (response.status >= 500 && retries > 1) {
        // eslint-disable-next-line
        console.log(`Recieved response status of ${response.status} when fetching guild, retrying. ${retries} retries left.`);
        return guild(id, retries - 1);
      }

      return Promise.reject(response);
    });
}

function characters (token, retries) {
  if (retries === undefined) {
    // eslint-disable-next-line
    retries = 5;
  }

  return axios.get(`${config.gw2.endpoint}v2/characters?page=0&page_size=200`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(({ data }) => data, (response) => {
    if (response.status >= 500 && retries > 1) {
      // eslint-disable-next-line
      console.log(`Recieved response status of ${response.status} when fetching character, retrying. ${retries} retries left.`);
      return characters(token, retries - 1);
    }

    return Promise.reject(response);
  });
}

module.exports = {
  guild,
  characters,
};
