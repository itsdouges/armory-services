'use strict'

var RESOURCE = Object.freeze({
    token_endpoint: "/users/check/gw2-token/:token",
    email_endpoint: "/users/check/email/:email"
});

function CheckResource(server) {
	server.get(RESOURCES.token_endpoint, function (req, res) {
		checkResource
			.gw2Token({
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

	server.get(RESOURCES.email_endpoint, function (req, res) {
		checkResource
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
}

module.exports = CheckResource;