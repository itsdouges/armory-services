"use strict";

// TODO: Figure out best way for error handling.

var restify = require("restify"),
	restifyOAuth2 = require("restify-oauth2"),
	GottaValidate = require('gotta-validate'),
	axios = require('axios'),
	UsersController = require('./controllers/users'),
	CheckController = require('./controllers/check'),
	Gw2TokenController = require('./controllers/character'),
	CharacterController = require('./controllers/character'),
	AuthController = require('./controllers/auth');
	Gw2Api = require('./services/gw2-api');	

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

function Server(models, env) {
	var gw2Api = Gw2Api(axios, env);

	var users = new UsersController(models, GottaValidate, gw2Api);
	var gw2Tokens = new Gw2TokenController(models, GottaValidate, gw2Api);
	var characters = new Gw2TokenController(models, gw2Api);
	var checks = new CheckController(GottaValidate);
	var auths = AuthController(models);

	var server = restify.createServer({
	    name: "api.armory.net.au",
	    version: env.version
	});

	server.use(restify.authorizationParser());
	server.use(restify.bodyParser());

	restifyOAuth2.ropc(server, {
		tokenEndpoint: RESOURCES.TOKEN, 
	  hooks: AuthHooks(models, config),
	  tokenExpirationTime: 60
	});

	require('./resources')(server);

	return server;
}

module.exports = Server;