"use strict";

// example of testing with sqlite
// http://cmme.org/tdumitrescu/blog/2014/02/node-sql-testing/

var restify = require("restify"),
	restifyOAuth2 = require("restify-oauth2"),
	UsersResource = require('./resources/users'),
	CheckResource = require('./resources/check'),
	GottaValidate = require('gotta-validate'),
	axios = require('axios'),
	Gw2Api = require('./services/gw2-api');

var RESOURCES = Object.freeze({
    USERS: "/users",
    CHECK_GW2_TOKEN: "/users/check/gw2-token/:token",
    EMAIL: "/users/check/email/:email"
});

function Server(models, env) {
	var server = restify.createServer({
	    name: "armory.net.au",
	    version: env.version
	});

	var gw2Api = Gw2Api(axios, env);

	GottaValidate.addDefaultRules();
	GottaValidate
		.addRule({
			name: 'valid-gw2-token',
			func: require('./rules/valid-gw2-token'),
			dependencies: {
				axios: axios,
				models: models
			}
		}).addRule({
			name: 'unique-email',
			func: require('./rules/unique-email'),
			dependencies: {
				models: models
			}
		});

	var AuthHooks = require('./auth/hooks');

	var usersResource = new UsersResource(models, GottaValidate, gw2Api);
	var checkResource = new CheckResource(GottaValidate);

	server.use(restify.authorizationParser());
	server.use(restify.bodyParser());

	restifyOAuth2.ropc(server, {
	  hooks: AuthHooks(models, config)
	});

	server.get('/', function (req, res) {
	    res.send("api.armory.net.au");

	    return next();
	});

	server.get(RESOURCES.CHECK_EMAIL, function (req, res) {
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

	server.get(RESOURCES.CHECK_GW2_TOKEN, function (req, res) {
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

	server.post(RESOURCES.USERS, function (req, res) {
		var user = {
			alias: req.params.alias,
			email: req.params.email,
			password: req.params.password,
			gw2ApiToken: req.params.gw2ApiToken
		};

		usersResource
			.create(user)
			.then(function () {
				res.send(200);
				return next();
			}, function (e) {
				res.send(400, e);
				return next();
			});
	});

	return server;
}

module.exports = Server;