'use strict';

var q = require('q');

function CharacterController (models, gw2Api) {
	CharacterController.prototype.read = function (name, ignorePrivacy, email) {
		var characterFromDb;

		var query = {
				include: [{
					model: models.Gw2ApiToken,
					include: [{
						model: models.User
					}]
				}],
				where: {
					name: name
				}
			};

		if (email) {
			query.include[0].include = [{
				model: models.User,
				where: {
					email: email
				}
			}];
		}

		return models
			.Gw2Character
			.findOne(query)
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
					// if (response.status === 403 || response.status === 401) {
					// 	return models.Gw2ApiToken
					// 		.destroy({
					// 			where: {
					// 				token: characterFromDb.Gw2ApiToken.token
					// 			}
					// 		});
					// }

					return q.reject(response);
				});
			})
			.then(function (data) {
				if (data === 1) {
					return undefined;
				}

				data.authorization = {
					showPublic: characterFromDb.showPublic,
					showGuild: characterFromDb.showGuild
				};

				data.accountName = characterFromDb.Gw2ApiToken.accountName;
				data.alias = characterFromDb.Gw2ApiToken.User.alias;

				if (characterFromDb.guild) {
					return models.Gw2Guild.findOne({
						where: {
							id: characterFromDb.guild
						}
					})
					.then(function (guild) {
						if (!guild) {
							return data;
						}

						data.guild_tag = guild.tag
						data.guild_name = guild.name;

						return data;
					});
				} else {
					return data;
				}
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
}

module.exports = CharacterController;