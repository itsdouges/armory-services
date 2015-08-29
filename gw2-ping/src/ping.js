var underscore = require('underscore');

var defaultOptions = {
	retries: 2,
	verbose: false
};

// TODO: Need a proper logging implementation ! 
// TODO: Need to implement database calls.

function pingUser(user) {
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

	this.request
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

function Client(options, requestClient, database) {
	underscore.extend(defaultOptions, options);

	this.request = requestClient;
	this.db = database;
}

Client.prototype.ping = function () {
	var scope = this;
	defaultOptions.verbose ? console.log('.') : '';

	this.db.users.forEach(function (user) {
		pingUser.call(scope, user);
	});
};

module.exports = Client;