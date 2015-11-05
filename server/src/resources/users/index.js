'use strict';

var RESOURCE = Object.freeze({
	get: '/users/me',
	put: '/users/me/password',
	post: '/users',
	publicGet: '/users/:alias'
});

function UserResource(server, controller) {
	server.get(RESOURCE.get, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

    // TODO: Stop sending password hash.
		controller
			.read(req.username)
			.then(function (data) {
				res.send(200, data);
				return next();
			});
	});

	server.get(RESOURCE.publicGet, function (req, res, next) {
		controller
			.readPublic(req.params.alias)
			.then(function (data) {
				res.send(200, data);
				return next();
			}, function () {
				// todo: error handling
				res.send(404);
				return next();
			});
	});

	server.put(RESOURCE.put, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

    var user = {
    	email: req.username,
    	password: req.params.password,
    	currentPassword: req.params.currentPassword
    };

		controller
			.updatePassword(user)
			.then(function () {
				res.send(200);
				return next();
			}, function (e) {
				res.send(400, e);
				return next();
			});
	});

	server.post(RESOURCE.post, function (req, res, next) {
		var user = {
			alias: req.params.alias,
			email: req.params.email.toLowerCase(),
			password: req.params.password
		};

		controller
			.create(user)
			.then(function () {
				res.send(200);
				return next();
			}, function (e) {
				res.send(400, e);
				return next();
			});
	});
}

module.exports = UserResource;