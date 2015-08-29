'use strict';

var q = require('q');

function validGw2Token(name, object, dependencies) {
	var token = object[name];
	if (!token) {
		return q.resolve();
	}

	var defer = q.defer();

	dependencies.models
		.Gw2ApiToken
		.findOne({ where: { token: token }})
		.then(function (item) {
			if (item) {
				defer.resolve({
					property: name,
					message: 'is already being used'
				});
			} else {
				checkGw2Api(token);
			}
		}, function (e) {
			throw e;
		});

		function checkGw2Api(token) {
			dependencies.axios.get(dependencies.env.gw2.endpoint + 'v2/tokeninfo', {
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
						return defer.resolve({
							property: name,
							message: 'needs characters and inventories permission'
						});
					}

					return defer.resolve();
				}, function (error) {
					return defer.resolve({
							property: name,
							message: 'invalid token'
						});
				});
		}

	return defer.promise;
}

module.exports = validGw2Token;