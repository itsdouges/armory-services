'use strict';

var fetchTokens = require('./services/fetch-tokens');
var 

/**
 * Ping Controller
 * Basic flow is as follows:
 * 1. Fetch tokens from db
 * 2. Get first token
 * 3. Hit v2/characters endpoint with token
 * 4. Iterate through the response of step 3, hit v2/characters/{name} endpoint with each name
 * 5. Build array of character data, push it into the db
 * 6. Rinse repeat until the end of the array
 */
function PingController(env, axios, models) {
	var fetchTokensFromDb = function () {

	};

	var pingUser = function (user) {
		if (!user.token || !user.tokenValid) {
			defaultOptions.verbose ? console.log('Invalid token, ignoring user.') : '';
			return;
		}

		var options = {
			uri: 'https://api.guildwars2.com/v2/characters',
			method: 'GET',
			headers: {
				'Authorization': 'Bearer ' + user.token
			}
		};

		axios.request
			.get(options)
			.then(function(data) {
				defaultOptions.verbose ? console.log('SUCCESS') : '';

				user.characters = data;
			}, function(error) {
				if (error.statusCode == 403) {
					defaultOptions.verbose ? console.log('Token was rejected, setting to invalid.') : '';
					user.tokenValid = false;
				} else if (error.statusCode === 500) {
					console.log('GW2 Api had an error occur.');
				} else {
					console.log('Can\'t talk out from the network!');
				}
			});
	}

	PingController.prototype.ping = function () {
		defaultOptions.verbose ? console.log('.') : '';

		this.db.users.forEach(function (user) {
			pingUser(user);
		});
	};
}

module.exports = PingController;