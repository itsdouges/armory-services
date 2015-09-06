'use strict'

var RESOURCE = Object.freeze({
    token_endpoint: "/users/check/gw2-token/:token",
    email_endpoint: "/users/check/email/:email",
    alias_endpoint: "/users/check/alias/:alias"
});

function CheckResource(server, controller) {
	server.get(RESOURCE.token_endpoint, function (req, res, next) {
		controller
			.gw2Token({
				token: req.params.token
			})
			.then(function (data) {
				res.send(200, data);
				return next();
			}, function (e) {
				res.send(400, e);
				return next();
			});
	});

	server.get(RESOURCE.email_endpoint, function (req, res, next) {
		controller
			.email({
				email: req.params.email
			})
			.then(function () {
				res.send(200);
				return next();
			}, function (e) {
				res.send(400, e);
				return next();
			});
	});

	server.get(RESOURCE.alias_endpoint, function (req, res, next) {
		controller
			.alias({
				alias: req.params.alias
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

module.exports = CheckResource;