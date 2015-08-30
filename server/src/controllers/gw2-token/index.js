'use strict';

var q = require('q');

function Gw2TokenController(models, Validator, gw2Api) {
	Validator.addResource({
		name: 'gw2-token',
		mode: 'add',
		rules: {
			token: ['valid-gw2-token', 'no-white-space']
		}
	});

	// TODO: Clean up messy async code.

	Gw2TokenController.prototype.add = function (id, token) {
		function addTokenToUser(id, token) {
			gw2Api
				.readAccount(token)
				.then(function (account) {
					// TODO: This logic is duplicated in user resource. Make it better.
					models.Gw2ApiToken
						.create({
							token: token,
							UserId: id,
							accountName: account.name
						}).then(function () {
							return;
						});
				});
		}

		var validator = Validator({
			resource: 'users',
			mode: 'update-gw2-token'
		});

		var promise = validator
			.validate(token);

			promise.then(function () {
				addTokenToUser(id, token);
			});

		return promise;
	};

	Gw2TokenController.prototype.remove = function (id, token) {
		return models.Gw2ApiToken
			.destroy({
				where: {
					UserId: id,
					token: token
				}
			});
	};
}

module.exports = Gw2TokenController;