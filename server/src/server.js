"use strict";

// http://cmme.org/tdumitrescu/blog/2014/02/node-sql-testing/

var restify = require("restify"),
	restifyOAuth2 = require("restify-oauth2"),
	UsersResource = require('./resources/users'),
	UserValidator = require('./validators/user-validator');

var RESOURCES = Object.freeze({
    USERS: "/users"
});

function Server(models) {
	var server = restify.createServer({
	    name: "armory.net.au",
	    version: require("../package.json").version
	});

	var usersResource = new UsersResource(models, new UserValidator(models.User));

	server.use(restify.authorizationParser());
	server.use(restify.bodyParser());

	// restifyOAuth2.ropc(server, {
	//     // hooks: hooks
	// });

	server.get('/', function (req, res) {
	    res.send("api.armory.net.au");
	});

	server.post(RESOURCES.USERS, usersResource.createUser);

	return server;
}

module.exports = Server;