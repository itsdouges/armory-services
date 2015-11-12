'use strict';

var RESOURCES = Object.freeze({
	personal_characters: 'users/me/characters',
	user_characters: 'users/:alias/characters',
	myCharacter: 'users/me/characters/:name'
});

function CharactersResource(server, controller) {
	server.get(RESOURCES.personal_characters, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

		controller
			.list(req.username)
			.then(function (characters) {
				res.send(200, characters);
				return next();
			}, function (error) {
				res.send(500, error);
				return next();
			});
	});

	server.get(RESOURCES.user_characters, function (req, res, next) {
		controller
			.list(null, req.params.alias)
			.then(function (characters) {
				res.send(200, characters);
				return next();
			}, function (error) {
				res.send(500, error);
				return next();
			});
	});

	server.get(RESOURCES.myCharacter, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }
		
		controller
			.read(req.params.name, true, req.username)
			.then(function (character) {
				if (character) {
					res.send(200, character);
				} else {
					res.send(404);
				}

				return next();
			}, function (error) {
				res.send(500, error);
				return next();
			});
	});
}

module.exports = CharactersResource;