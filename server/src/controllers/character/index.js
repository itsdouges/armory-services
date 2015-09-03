'use strict';

var q = require('q');

function CharacterController(models, gw2Api) {
	CharacterController.prototype.read = function (name) {
		var characterFromDb;

		return models
			.Gw2Character
			.findOne({
				include: [{
					model: models.Gw2ApiToken,
					where: {
						valid: true
					}
				}],
				where: {
					name: name
				}
			})
			.then(function (result) {
				if (!result) {
					return q.reject();
				}

				characterFromDb = result;

				return {
					name: name,
					token: result.Gw2ApiTokenToken,
					showCrafting: result.showCrafting,
					showBags: result.showBags
				};
			})
			.then(function (data) {
				return gw2Api.readCharacter(data.name, {
					token: data.token,
					showBags: data.showBags,
					showCrafting: data.showCrafting
				})
				.then(null, function (response) {
					if (response.status === 403) {
						return models.Gw2ApiToken
							.update({
								valid: false
							}, {
								where: {
									token: characterFromDb.Gw2ApiToken.token
								}
							}).then(function () {
								return q.reject();
							})
					}

					return q.reject(response);
				});
			})
			.then(function (data) {
				data.authorization = {
					showPublic: characterFromDb.showPublic,
					showGuild: characterFromDb.showGuild
				};

				return data;
			});
	};

	CharacterController.prototype.listByEmail = function (email) {
		// todo: extend this for alias later.
		return models
			.Gw2Character
			.findAll({
				include: [{
					model: models.Gw2ApiToken,
					where: {
						valid: true
					},
					include: [{
						model: models.User,
						where: {
							email: email
						}
					}]
				}]
			})
			.then(function (characters) {
				return characters.map(function (c) {
					return {
						accountName: c.Gw2ApiToken.accountName,
						world: c.Gw2ApiToken.world,
						name: c.name,
						gender: c.gender,
						profession: c.profession,
						level: c.level,
						race: c.race
					};
				});
			});
	};

	// TODO: Update character endpoint!
	// TODO: List characters (by user) endpoint!
	// TODO: List characters (by guild) endpoint!
}

module.exports = CharacterController;