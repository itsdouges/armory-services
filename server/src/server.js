"use strict";

// http://cmme.org/tdumitrescu/blog/2014/02/node-sql-testing/

var restify = require("restify");
var restifyOAuth2 = require("restify-oauth2");
var usersResource = require('./resources/users');

var server = restify.createServer({
    name: "armory.net.au",
    version: require("../package.json").version
});

var RESOURCES = Object.freeze({
    USERS: "/users"
});

server.use(restify.authorizationParser());
server.use(restify.bodyParser());

// restifyOAuth2.ropc(server, {
//     // hooks: hooks
// });

server.get('/', function (req, res) {
    res.send("api.armory.net.au");
});

// create user
server.post(RESOURCES.USERS, usersResource.createUser);

module.exports = server;