'use strict';

var q = require('q');

function Gw2Api (axios, env) {
  function readPvpStats (token) {
    return axios.get(env.gw2.endpoint + 'v2/pvp/stats', {
      headers: {
        'Authorization' : 'Bearer ' + token
      }
    })
    .then(function (e) {
      return e.data;
    });
  }

  function readPvpStandings (token) {
    return axios.get(env.gw2.endpoint + 'v2/pvp/standings', {
      headers: {
        'Authorization' : 'Bearer ' + token
      }
    })
    .then(function (e) {
      return e.data;
    });
  }

  function readPvpGames (token) {
    return axios.get(env.gw2.endpoint + 'v2/pvp/games', {
      headers: {
        'Authorization' : 'Bearer ' + token
      }
    })
    .then(function (response) {
      var ids = response.data.join(',');
      if (!ids) {
        return response;
      }

      return axios.get(env.gw2.endpoint + 'v2/pvp/games?ids=' + ids, {
        headers: {
          'Authorization' : 'Bearer ' + token
        }
      });
    })
    .then(function (response) {
      return response && response.data;
    });
  }

  function readAccount (token) {
    return axios.get(env.gw2.endpoint + 'v2/account', {
        headers: {
          'Authorization' : 'Bearer ' + token
        }
    })
    .then(function (e) {
      return e.data;
    });
  }

  function readTokenInfo (token) {
    return axios.get(env.gw2.endpoint + 'v2/tokeninfo', {
        headers: {
          'Authorization' : 'Bearer ' + token
        }
    })
    .then(function (e) {
      return e.data;
    });
  }

  function readTokenInfoWithAccount (token) {
    var accountPromise = readAccount(token);
    var infoPromise = readTokenInfo(token);

    return q.all([accountPromise, infoPromise])
      .spread(function (acc, info) {
        return q.resolve({
          info: info.permissions,
          world: acc.world,
          accountId: acc.id,
          accountName: acc.name
        });
      });
  }

  function readCharacters (token) {
    return axios.get(env.gw2.endpoint + 'v2/characters', {
        headers: {
          'Authorization' : 'Bearer ' + token
        }
    })
    .then(function (e) {
      return e.data;
    });
  }

  function readCharacter (name, options) {
    var promise = axios.get(env.gw2.endpoint + 'v2/characters/' + name, {
        headers: {
          'Authorization' : 'Bearer ' + options.token
        }
    })
    .then(function (data) {
      var character = data.data;

      if (!options.showBags) {
        character.bags = undefined;
      }

      if (!options.showCrafting) {
        character.crafting = undefined;
      }

      if (!options.showEquipment) {
        character.equipment = undefined;
      }

      if (!options.showBuilds) {
        character.specializations = undefined;
      }

      return character;
    });

    return promise;
  }

  var exports = {
    readCharacters: readCharacters,
    readCharacter: readCharacter,
    readAccount: readAccount,
    readTokenInfoWithAccount: readTokenInfoWithAccount,
    readPvpStats: readPvpStats,
    readPvpStandings: readPvpStandings,
    readPvpGames: readPvpGames,
  };

  return exports;
}

module.exports = Gw2Api;