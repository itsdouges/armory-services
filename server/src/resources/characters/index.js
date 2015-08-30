'use strict';

var RESOURCE = Object.freeze({
	endpoint: '/characters'
});

function CharactersResource(server) {
	server.get(RESOURCES.token_endpoint, function (req, res) {
		controller
			.read(req.params.name)
			.then(function (character) {
				res.send(200, character);
				return next();
			}, function (e) {
				res.send(404);
				return next();
			});
	});
}

module.exports = CharactersResource;