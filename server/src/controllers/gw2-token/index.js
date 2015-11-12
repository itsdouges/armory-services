'use strict';

var q = require('q');
var axios = require('axios');
var config = require('../../../env/env_config');

function Gw2TokenController (models, Validator, gw2Api) {
	Validator.addResource({
		name: 'gw2-token',
		mode: 'add',
		rules: {
			token: ['valid-gw2-token', 'no-white-space']
		}
	});

	Gw2TokenController.prototype.add = function (email, token) {
		function addTokenToUser (id, gw2Token) {
			return gw2Api
				.readTokenInfoWithAccount(gw2Token)
				.then(function (tokenInfo) {
					var wrappedToken = {
						token: gw2Token,
						UserId: id,
						permissions: tokenInfo.info.join(','),
						world: tokenInfo.world,
						accountId: tokenInfo.accountId,
						accountName: tokenInfo.accountName
					};

					return models
						.Gw2ApiToken
						.create(wrappedToken);
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
				});
			})
			.then(function (user) {
					return user.id;
			})
			.then(function (id) {
				return addTokenToUser(id, token);
			})
			.then(function (createdToken) {
				console.log('Posting to: ' + config.ping.host + ':' + config.ping.port + '/fetch-characters');

				return axios.post('http://' + config.ping.host + ':' + config.ping.port + '/fetch-characters', {
					token: token
				}).then(function () {
					return createdToken;
				});
			})
			.then(function (createdToken) {
				return {
					token: createdToken.token,
					accountName: createdToken.accountName,
					permissions: createdToken.permissions,
					world: createdToken.world,
					valid: createdToken.valid
				};
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
						permissions: token.permissions,
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