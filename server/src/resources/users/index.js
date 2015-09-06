'use strict';

var RESOURCE = Object.freeze({
	get: '/users/me',
	put: '/users/me',
	post: '/users'
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

	server.put(RESOURCE.put, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

    var user = {
    	email: req.username,
    	password: req.params.password,
    	alias: req.params.alias,
    	currentPassword: req.params.currentPassword
    };

		controller
			.update(user)
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
			email: req.params.email,
			password: req.params.password,
			gw2ApiTokens: req.params.gw2ApiTokens
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