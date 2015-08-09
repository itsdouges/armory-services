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
    TOKEN: "/token"
});

server.use(restify.authorizationParser());
server.use(restify.bodyParser({ 
    mapParams: false 
}));

restifyOAuth2.ropc(server, { 
    tokenEndpoint: RESOURCES.TOKEN, 
    hooks: hooks,
    tokenExpirationTime: 60
});

server.get(RESOURCES.INITIAL, function (req, res) {
    var response = "Auth endpoint for armory.net.au";

    res.contentType = "application/json";
    res.send(response);
});

server.get(RESOURCES.TOKEN, function (req, res) {
    if (!req.username) {
        return res.sendUnauthenticated();
    }

    res.contentType = "application/json";
    res.send();
});

server.listen(8080);