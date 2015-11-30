'use strict';

var q = require('q');
var throat = require('throat');
var fetchTokens = require('../services/fetch-tokens');

/**
 * Ping Controller
 */
function PingController(env, axios, models, fetchGw2) {
	var that = this;

	PingController.prototype.mapTokensAndCallApi = function (tokens) {
		return q.allSettled(tokens.map(throat(function (token) {
			return that.fetchUserCharacterData(token.token);
		}, 20)));
	};

	PingController.prototype.ping = function () {
		var promise = fetchTokens(models)
			.then(that.mapTokensAndCallApi)
			.then(function () {
				console.log('Finished fetch!');
			}, function (e) {
				console.trace(e);
				console.error('Something bad happened', e);
			});

		return promise;
	};

	PingController.prototype.fetchUserCharacterData = function (token) {
		return fetchGw2
			.fetchCharacters(env.gw2.endpoint, token, axios)
			.then(function (characters) {
				// TODO: Diff and remove characters NOT in array, instead of removing everything.
				return models.Gw2Character.destroy({
					where: {
						Gw2ApiTokenToken: token
					}
				})
				.then(function () {
					var promises = []; 

					characters.forEach(function (char) {
						var dbPromise = models
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
								Gw2ApiTokenToken: token
						});

						promises.push(dbPromise);

						if (!char.guild) {
							return;
						}

						var guildPromise = models.Gw2Guild.findOne({
							where: {
								id: char.guild
							}
						})
						.then(function (guild) {
							if (guild) {
								return;
							}

							return fetchGw2
								.guild(char.guild)
								.then(function (guild) {
									return models.Gw2Guild.create({
										id: guild.guild_id,
										name: guild.guild_name,
										tag: guild.tag
									});
								});
						});

						promises.push(guildPromise);
					});

					return q.allSettled(promises);
				});
			})
			.catch(function (response) {
				switch (response.status) {
					case 400:
					case 401:
						console.error('Recieved ' + response.status + ' during fetch @ ' + new Date().toGMTString() + ', removing token.');

						return models.Gw2ApiToken
							.destroy({
								where: {
									token: token
								}
							});

					console.error('Problem fetching token, recieved status of ' + response.status + ' with message ' + response.data + ' @ ' + new Date().toGMTString());
					console.error(response);
				}

				return q.reject(response);
			});
	};
}

module.exports = PingController;