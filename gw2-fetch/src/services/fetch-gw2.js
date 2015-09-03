'use strict';

var q = require('q');

function fetchCharacters (endpoint, token, axios, models) {
	return axios.get(endpoint + 'v2/characters?page=0&page_size=200', {
			headers: {
				'Authorization' : 'Bearer ' + token
			}
	})
	.then(function (characters) {
		return characters.data;
	}, function (response) {
		if (response.status === 401 || response.status === 402) {
			// invalidate the token !
		} else  if (response === 500) {
			return fetchCharacters (endpoint, token, axios, models);
		}

		// unhandled
	});
}

module.exports = {
	fetchCharacters: fetchCharacters
};