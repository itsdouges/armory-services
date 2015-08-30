'use strict';

var q = require('q');

function CharacterController(models, gw2Api) {
	CharacterController.prototype.read = function (name) {
		var characterFromDb;

		return models
			.Gw2Character
			.findOne({
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
}

module.exports = CharacterController;