'use strict';

var q = require('q');

function fetchCharacters (endpoint, token, axios, models) {
	return axios.get(endpoint + 'v2/characters?page=0&page_size=200', {
			headers: {
				'Authorization' : 'Bearer ' + token
			}
	}).then(function (characters) {
		return characters.data;
	}, function (response) {
		if (response === 500) {
			// Try again up to 3 times
		}

		return q.reject(response);
	});
}

module.exports = {
	fetchCharacters: fetchCharacters
};