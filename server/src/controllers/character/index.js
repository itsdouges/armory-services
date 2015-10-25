'use strict';

var q = require('q');

function CharacterController (models, gw2Api) {
	// TODO: Add in where email = xyz so authenticated users can only
	// Gain access to their own characters.
	CharacterController.prototype.read = function (name, ignorePrivacy) {
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
					showBags: result.showBags,
					showEquipment: result.showEquipment,
					showBuilds: result.showBuilds,
					showPvp: result.showPvp,
					showGuild: result.showGuild,
					showPublic: result.showPublic
				};
			})
			.then(function (data) {
				return gw2Api.readCharacter(data.name, {
					token: data.token,
					showBags: ignorePrivacy || data.showBags,
					showCrafting: ignorePrivacy || data.showCrafting,
					showEquipment: ignorePrivacy || data.showEquipment,
					showBuilds: ignorePrivacy || data.showBuilds
				})
				.then(null, function (response) {
					if (response.status === 403 || response.status === 401) {
						return models.Gw2ApiToken
							.destroy({
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

				data.accountName = characterFromDb.Gw2ApiToken.accountName;

				return data;
			});
	};

	CharacterController.prototype.list = function (email, alias) {
		var where = {};

		if (email) {
			where.email = email;
		}

		if (alias) {
			where.alias = alias;
		}

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
						where: where
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