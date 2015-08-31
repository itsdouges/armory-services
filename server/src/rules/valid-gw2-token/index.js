'use strict';

var q = require('q');

function validGw2Token(name, object, dependencies) {
	var token = object[name];
	if (!token) {
		return q.resolve();
	}

	var promise = dependencies.models
		.Gw2ApiToken
		.findOne({ where: { token: token }})
		.then(function (item) {
			if (item) {
				return {
					property: name,
					message: 'is already being used'
				};
			}
			
			return checkGw2Api(token);
		});

		function checkGw2Api(token) {
			// TODO: Put retry logic here incase the call fails.
			return dependencies.axios.get(dependencies.env.gw2.endpoint + 'v2/tokeninfo', {
					headers: {
						'Authorization' : 'Bearer ' + token
					}
				})
				.then(function (response) {
					var permissions = response.data.permissions;
					var hasCharacters = permissions.filter(function (item) {
						return item === 'characters' || item === 'inventories';
					});

					if (hasCharacters.length !== 2) {
						return {
							property: name,
							message: 'needs characters and inventories permission'
						};
					}
				}, function (error) {
					return q.resolve({
						property: name,
						message: 'invalid token'
					});
				});
		}

	return promise;
}

module.exports = validGw2Token;