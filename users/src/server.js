"use strict";

var restify = require("restify");
var restifyOAuth2 = require("restify-oauth2");
var hooks = require("./auth-hooks");

var server = restify.createServer({
    name: "armory.net.au:auth",
    version: require("../package.json").version,
    formatters: {
        "application/hal+json": function (req, res, body) {
            return res.formatters["application/json"](req, res, body);
        }
    }
});

var RESOURCES = Object.freeze({
    INITIAL: "/",
    USERS: "/users"
});

server.use(restify.authorizationParser());
server.use(restify.bodyParser({ 
    mapParams: false 
}));

restifyOAuth2.ropc(server, {
    hooks: hooks
});

server.get(RESOURCES.INITIAL, function (req, res) {
    var response = "Users service for armory.net.au";

    res.contentType = "application/json";
    res.send(response);
});

// create user
server.post(RESOURCES.USERS, function (req, res) {
 // todo: implement
});

// update user
server.put(RESOURCES.USERS, function (req, res) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

    // todo: implement

    res.contentType = "application/json";
    res.send("You are authenticated!");
});

server.listen(8082);