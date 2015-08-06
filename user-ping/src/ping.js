var underscore = require('underscore');
var rest = require('rest');

var defaultOptions = {
	cycle: 600, // 10 min per cycle
	runUntilCount: null
};

var db = {
	users: [
		{
			email: 'laheen@gmail.com',
			token: '3990C73C-18C1-6345-9184-1F99E1FF1F94F74DBE68-D2A7-4C32-908D-4AA1E513B39A',
			tokenValid: true,
			characters: []
		}
	]
}

function pingUser(user) {
	if (!user.token || !user.tokenValid) {
		console.log('Ignoring user.');
		return;
	}

	var token = user.token;

	console.log('Reading user characters.');

	rest('https://api.guildwars2.com/v2/characters')
		.then(function(e){
			console.log('Success: Characters found!');
			console.log(e);

			user.characters = e.data;
		}, function (e) {
			console.log('Error: Couldn\'t read characters.');
		});
}

function Client(options, restClient) {
	underscore.extend(defaultOptions, options);
}

Client.prototype.start = function () {
	setInterval(function () {
		db.users.forEach(function (user) {
			pingUser(user);
		});
	}, defaultOptions.cycle)
};

exports.Client = Client;