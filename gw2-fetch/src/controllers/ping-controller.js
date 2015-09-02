'use strict';

var q = require('q');
var fetchTokens = require('../services/fetch-tokens');

/**
 * Ping Controller
 */
function PingController(env, axios, models, fetchGw2) {
	PingController.prototype.ping = function () {
		var promise = fetchTokens(models)
			.then(function (tokens) {
				var userPromises = [];

				tokens.forEach(function (token) {
					userPromises.push(fetchUserCharacterData(token));
				});

				return q.all(userPromises);
			})			
			.then(function () {
				console.log('Finished fetch!');
			});

		return promise;
	};

	var fetchUserCharacterData = function (token) {
		return fetchGw2.fetchCharacters(env.gw2.endpoint, token.token, axios, models)
			.then(function (characters) {
				var dbPromises = []; 

				// edge cases
				// 1. user deletes a character
				// 2. user renames a character (akin to delete)
				// 3. token is invalid

				characters.forEach(function (char) {
					var promise = models.Gw2Character
						.upsert({
							name: char.name,
							race: char.race,
							gender: char.gender,
							profession: char.profession,
							level: char.level,
							guild: char.guild,
							created: char.created,
							age: char.age,
							deaths: char.deaths,
							Gw2ApiTokenToken: token.token
					});

					dbPromises.push(promise);
				});

				return q.all(dbPromises);
			}, function () {

			});
	};
}

module.exports = PingController;