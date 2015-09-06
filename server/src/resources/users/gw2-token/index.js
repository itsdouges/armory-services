'use strict';

var RESOURCE = Object.freeze({
	main: '/users/me/gw2-tokens',
	item: '/users/me/gw2-tokens/:token'
});

function Gw2TokenResource(server, controller) {
	server.get(RESOURCE.main, function (req, res, next) {
		// TODO: TEST

    if (!req.username) {
        return res.sendUnauthenticated();
    }
		
		controller
			.list(req.username)
			.then(function (tokens) {
				res.send(200, tokens);
				return next();
			}, function (e) {
				res.send(400, e);
				return next();
			});
	});

	server.post(RESOURCE.main, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }
		
		controller
			.add(req.username, req.params.token)
			.then(function () {
				res.send(200);
				return next();
			}, function (e) {
				res.send(400, e);
				return next();
			});
	});

	server.del(RESOURCE.item, function (req, res, next) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }
		
		controller
			.remove(req.username, req.params.token)
			.then(function () {
				res.send(200);
				return next();
			}, function (e) {
				res.send(400, e);
				return next();
			});
	});
}

module.exports = Gw2TokenResource;