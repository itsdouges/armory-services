'use strict';

var q = require('q');

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
				console.log('Recieved response status of ' + response.status + ', retrying. ' + retries + ' retries left.');
				return fetchCharacters(endpoint, token, axios, retries - 1);
			}

			return q.reject(response);
		});
}

module.exports = {
	fetchCharacters: fetchCharacters
};