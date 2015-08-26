'use strict';

var q = require('q');

function validGw2Token(name, object, dependencies) {
	var item = object[name];
	if (!item) {
		return q.resolve();
	}

	var promise = dependencies.axios.get(dependencies.env.gw2.endpoint + 'tokeninfo', {
			headers: {
				'Authorization' : 'Bearer ' + item
			}
		})
		.then(function (response) {
			var permissions = response.data.permissions;
			var hasCharacters = permissions.filter(function (item) {
				return item === 'characters';
			});

			if (!hasCharacters.length) {
				return q.reject({
					property: name,
					message: 'needs characters permission'
				});
			}

			return;
		}, function (error) {
			return q.reject({
					property: name,
					message: 'invalid token'
				});
		});

	return promise;
}

module.exports = validGw2Token;