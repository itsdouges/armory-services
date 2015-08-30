'use strict';

var RESOURCE = Object.freeze({
	get: '/users/me',
	put: '/users/me',
	post: '/users'
});

function UserResource(server) {
	server.get(RESOURCE.get, function (req, res) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

		controller
			.read(req.username)
			.then(function () {
				res.send(200);
				return next();
			}, function (e) {
				res.send(404);
				return next();
			});
	});

	server.put(RESOURCE.put, function (req, res) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

		controller
			.update(req.username)
			.then(function () {
				res.send(200);
				return next();
			}, function (e) {
				res.send(404);
				return next();
			});
	});

	server.post(RESOURCE.post, function (req, res) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

		var user = {
			alias: req.params.alias,
			email: req.params.email,
			password: req.params.password,
			gw2ApiToken: req.params.gw2ApiToken
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