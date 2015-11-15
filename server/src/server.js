"use strict";

// TODO: Figure out best way for error handling.

var restify = require("restify"),
	restifyOAuth2 = require("restify-oauth2"),
	GottaValidate = require('gotta-validate'),
	axios = require('axios'),
	UsersController = require('./controllers/user'),
	CheckController = require('./controllers/check'),
	Gw2TokenController = require('./controllers/gw2-token'),
	CharacterController = require('./controllers/character'),
	AuthController = require('./controllers/auth'),
	Gw2Api = require('./services/gw2-api');	

function Server(models, config) {
	GottaValidate.addDefaultRules();
	GottaValidate
		.addRule({
			name: 'valid-gw2-token',
			func: require('./rules/valid-gw2-token'),
			dependencies: {
				axios: axios,
				models: models,
				env: config
			}
		}).addRule({
			name: 'unique-email',
			func: require('./rules/unique-email'),
			inherits: 'email',
			dependencies: {
				models: models
			}
		}).addRule({
			name: 'unique-alias',
			func: require('./rules/unique-alias'),
			dependencies: {
				models: models
			}
		}).addRule({
			name: 'min5',
			func: require('./rules/min').five
		})
		.addRule({
			name: 'ezpassword',
			func: require('./rules/password')
		});

	var gw2Api = Gw2Api(axios, config);

	var users = new UsersController(models, GottaValidate, gw2Api);
	var gw2Tokens = new Gw2TokenController(models, GottaValidate, gw2Api);
	var characters = new CharacterController(models, gw2Api);
	var checks = new CheckController(GottaValidate);
	var auths = AuthController(models, config);

	var server = restify.createServer({
	    name: "api.gw2armory.com",
	    version: config.version
	});

	restify.CORS.ALLOW_HEADERS.push('authorization');
	restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');
	server.use(restify.CORS({
		origins: config.allowed_cors
	}));

	server.use(restify.authorizationParser());
	server.use(restify.bodyParser());
	server.use(restify.gzipResponse());

	restifyOAuth2.ropc(server, {
		tokenEndpoint: '/token', 
	  hooks: auths,
	  tokenExpirationTime: config.jwt_tokens.expires_in
	});

	require('./resources')(server);
	require('./resources/characters')(server, characters);
	require('./resources/guilds')(server, models);
	require('./resources/users')(server, users);
	require('./resources/users/check')(server, checks);
	require('./resources/users/gw2-token')(server, gw2Tokens);
	require('./resources/users/characters')(server, characters);

	return server;
}

module.exports = Server;