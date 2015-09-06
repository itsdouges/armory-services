'use strict';

var RESOURCES = Object.freeze({
	personal_characters: 'users/me/characters',
	user_characters: 'users/:user/characters'
});

function CharactersResource(server, controller) {
	server.get(RESOURCES.personal_characters, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

		controller
			.listByEmail(req.username)
			.then(function (characters) {
				res.send(200, characters);
				return next();
			}, function (e) {
				// todo: error handling
				res.send(404);
				return next();
			});
	});
}

module.exports = CharactersResource;