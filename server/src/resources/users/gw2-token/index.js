'use strict';

var RESOURCE = Object.freeze({
	endpoint: '/users/gw2-token'
});

function Gw2TokenResource(server, controller) {
	server.post(RESOURCE.endpoint, function (req, res) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }
		
		controller
			.create({
				token: req.params.token
			})
			.then(function () {
				res.send(200);
				return next();
			}, function (e) {
				res.send(400, e);
				return next();
			});
	});

	server.delete(RESOURCE.endpoint, function (req, res) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }
		
		controller
			.delete({
				token: req.params.token
			})
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