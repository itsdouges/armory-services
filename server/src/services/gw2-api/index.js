'use strict';

function Gw2Api(axios, env) {
	function readAccount (token) {
		var promise = axios.get(env.gw2.endpoint + 'v2/account', {
				headers: {
					'Authorization' : 'Bearer ' + token
				}
		})
		.then(function (e) {
			return e.data;
		});

		return promise;
	}

	function readCharacter (name, options) {
		var promise = axios.get(env.gw2.endpoint + 'v2/characters/' + name, {
				headers: {
					'Authorization' : 'Bearer ' + options.token
				}
		})
		.then(function (data) {
			var character = data.data;

			if (!options.showBags) {
				character.bags = undefined;
			}

			if (!options.showCrafting) {
				character.crafting = undefined;
			}

			if (!options.showEquipment) {
				character.equipment = undefined;
			}

			return character;
		});

		return promise;
	}

	var exports = {
		readCharacter: readCharacter,
		readAccount: readAccount
	};

	return exports;
}

module.exports = Gw2Api;