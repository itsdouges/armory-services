'use strict';

var q = require('q');

function validGw2Token(name, val, dependencies) {
	if (!val) {
		return q.resolve();
	}

	var promise = dependencies.models
		.Gw2ApiToken
		.findOne({ where: { token: val }})
		.then(function (item) {
			if (item) {
				return {
					property: name,
					message: 'is already being used'
				};
			}
			
			return checkGw2Api(val);
		});

		function checkGw2Api(token) {
			var authCheck = dependencies.axios.get(dependencies.env.gw2.endpoint + 'v2/tokeninfo', {
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
				});

			var duplicateCheck = dependencies.axios.get(dependencies.env.gw2.endpoint + 'v2/account', {
					headers: {
						'Authorization' : 'Bearer ' + token
					}
			})
			.then(function (response) {
				var accountId = response.data.id;
				var accountName = response.data.name;

				return dependencies.models
					.Gw2ApiToken
					.findOne({
						where: {
							accountId: accountId,
							valid: true
						}
					})
					.then(function (item) {
						if (item) {
							return {
								property: name,
								message: 'key for ' + accountName + ' already exists'
							}; 
						}
					});
			});

			return q.all([authCheck, duplicateCheck])
				.then(function (responses) {
					if (responses[1]) {
						return responses[1];
					}

					if (responses[0]) {
						return responses[0];
					}
				}, function (error) {
					// todo: how do we want to handle 500s?
					return q.resolve({
						property: name,
						message: 'invalid token'
					});
				});
		}

	return promise;
}

module.exports = validGw2Token;