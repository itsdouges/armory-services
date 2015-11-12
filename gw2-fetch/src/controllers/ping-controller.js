'use strict';

var q = require('q');
var fetchTokens = require('../services/fetch-tokens');

/**
 * Ping Controller
 */
function PingController(env, axios, models, fetchGw2) {
	var that = this;

	PingController.prototype.ping = function () {
		var promise = fetchTokens(models)
			.then(function (tokens) {
				var userPromises = [];

				tokens.forEach(function (token) {
					userPromises.push(that.fetchUserCharacterData(token));
				});

				return q.all(userPromises);
			})
			.then(function () {
				console.log('Finished fetch!');
			}, function (e) {
				console.log(e);
			});

		return promise;
	};

	PingController.prototype.fetchUserCharacterData = function (token) {
		return fetchGw2.fetchCharacters(env.gw2.endpoint, token.token, axios, models)
			.then(function (characters) {
				return models.Gw2Character.destroy({
					where: {
						Gw2ApiTokenToken: token.token
					}
				})
				.then(function () {
					var dbPromises = []; 

					characters.forEach(function (char) {
						var promise = models
							.Gw2Character
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
				});
			})
			.catch(function (response) {
				switch (response.status) {
					case 400:
					case 401:
					case 403:
						return models.Gw2ApiToken
							.destroy({
								where: {
									token: token.token
								}
							});
				}

				return q.reject(response);
			});
	};
}

module.exports = PingController;