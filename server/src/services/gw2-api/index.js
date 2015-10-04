'use strict';

var q = require('q');

function Gw2Api (axios, env) {
	function readAccount (token) {
		return axios.get(env.gw2.endpoint + 'v2/account', {
				headers: {
					'Authorization' : 'Bearer ' + token
				}
		})
		.then(function (e) {
			return e.data;
		});
	}

	function readTokenInfo (token) {
		return axios.get(env.gw2.endpoint + 'v2/tokeninfo', {
				headers: {
					'Authorization' : 'Bearer ' + token
				}
		})
		.then(function (e) {
			return e.data;
		});
	}

	function readTokenInfoWithAccount (token) {
		var accountPromise = readAccount(token);
		var infoPromise = readTokenInfo(token);

		return q.all([accountPromise, infoPromise])
			.spread(function (acc, info) {
				return q.resolve({
					//name: info.name,
					info: info.permissions,
					world: acc.world,
					accountId: acc.id,
					accountName: acc.name
				});
			});
	}

	function readCharacters (token) {
		return axios.get(env.gw2.endpoint + 'v2/characters', {
				headers: {
					'Authorization' : 'Bearer ' + token
				}
		})
		.then(function (e) {
			return e.data;
		});
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
		readCharacters: readCharacters,
		readCharacter: readCharacter,
		readAccount: readAccount,
		readTokenInfoWithAccount: readTokenInfoWithAccount
	};

	return exports;
}

module.exports = Gw2Api;