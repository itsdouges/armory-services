'use strict';

var RESOURCES = Object.freeze({
	character: 'characters/:name'
});

function CharactersResource(server, controller) {
	server.get(RESOURCES.character, function (req, res, next) {
		controller
			.read(req.params.name, false)
			.then(function (character) {
				res.send(200, character);
				return next();
			}, function (e) {
				// todo: error handling
				res.send(404);
				return next();
			});
	});
}

module.exports = CharactersResource;