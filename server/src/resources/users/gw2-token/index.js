'use strict';

var RESOURCE = Object.freeze({
	post: '/users/me/gw2-token',
	del: '/users/me/gw2-token/:token'
});

function Gw2TokenResource(server, controller) {
	server.post(RESOURCE.post, function (req, res, next) {
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

	server.del(RESOURCE.del, function (req, res, next) {
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