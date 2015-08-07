var underscore = require('underscore');
var db;
var rest;

var defaultOptions = {
	retries: 2,
	verbose: false
};

function pingUser(user) {
	if (!user.token || !user.tokenValid) {
		defaultOptions.verbose ? console.log('Ignoring user.') : '';
		return;
	}

	var requestOptions = {
		path: '/v2/characters',
		retry: {
			'retries': defaultOptions.retries
		},
		headers: {
			'Authorization': 'Bearer ' + user.token
		},
		agent: false
	};

	rest.get(requestOptions, function(err, req, res, obj) {
		if (err) 
			if (err.statusCode == 403) {
			defaultOptions.verbose ? console.log('Authentication expired') : '';
			user.tokenValid = false;
		} else if (obj) {
			user.characters = obj;
		}
	});
}

function Client(options, restClient, database) {
	underscore.extend(defaultOptions, options);

	rest = restClient;
	db = database;
}

Client.prototype.ping = function () {
	defaultOptions.verbose ? console.log('.') : '';

	db.users.forEach(function (user) {
		pingUser(user);
	});
};

exports.Client = Client;