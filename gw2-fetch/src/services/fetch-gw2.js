'use strict';

var q = require('q');

var env = require('../../env/env_config');
var axios = require('axios');

function guild (id, retries) {
    if (retries === undefined) {
        retries = 5;
    }

    return axios.get(env.gw2.endpoint + 'v1/guild_details.json?guild_id=' + id)
        .then(function (response) {
            return response.data;
        }, function (response) {
            if (response.status >= 500 && retries > 1) {
                console.log('Recieved response status of ' + response.status + ' when fetching guild, retrying. ' + retries + ' retries left.');
                return guild(id, retries - 1);
            }

            return q.reject(response);
        });
}

function fetchCharacters (endpoint, token, axios, retries) {
    if (retries === undefined) {
        retries = 5;
    }

    return axios.get(endpoint + 'v2/characters?page=0&page_size=200', {
            headers: {
                'Authorization' : 'Bearer ' + token
            }
        })
        .then(function (characters) {
            return characters.data;
        }, function (response) {
            if (response.status >= 500 && retries > 1) {
                console.log('Recieved response status of ' + response.status + ' when fetching character, retrying. ' + retries + ' retries left.');
                return fetchCharacters(endpoint, token, axios, retries - 1);
            }

            return q.reject(response);
        });
}

module.exports = {
    guild: guild,
    fetchCharacters: fetchCharacters
};