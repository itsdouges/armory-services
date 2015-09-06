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

	Gw2TokenController.prototype.add = function (email, token) {
		function addTokenToUser(id, gw2Token) {
			return gw2Api
				.readAccount(gw2Token)
				.then(function (account) {
					models
						.Gw2ApiToken
						.create({
							token: gw2Token,
							UserId: id,
							world: account.world,
							accountId: account.id,
							accountName: account.name
						});
				});
		}

		var validator = Validator({
			resource: 'gw2-token',
			mode: 'add'
		});

		return validator
			.validate({
				token: token
			})
			.then(function () {
				return models.User.findOne({
					where: {
						email: email
					}
				})
				.then(function (user) {
					return user.id;
				})
			})
			.then(function (id) {
				return addTokenToUser(id, token);
			});
	};

	Gw2TokenController.prototype.list = function (email) {
		return models
			.Gw2ApiToken
			.findAll({
				include: [{
					model: models.User,
					where: {
						email: email
					}
				}]
			})
			.then(function (tokens) {
				return tokens.map(function (token) {
					return {
						token: token.token,
						accountName: token.accountName,
						world: token.world,
						valid: token.valid
					};
				});
			});
	};

	Gw2TokenController.prototype.remove = function (email, token) {
		return models
			.User
			.findOne({
				where: {
					email: email
				}
			})
			.then(function (user) {
				return user.id;
			})
			.then(function (id) {
				return models.Gw2ApiToken
					.destroy({
						where: {
							UserId: id,
							token: token
						}
					});
			});
	};
}

module.exports = Gw2TokenController;