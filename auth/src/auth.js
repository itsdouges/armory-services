"use strict";

var restify = require("restify");
var restifyOAuth2 = require("restify-oauth2");
var hooks = require("./hooks");

// NB: we're using [HAL](http://stateless.co/hal_specification.html) here to communicate RESTful links among our
// resources, but you could use any JSON linking format, or XML, or even just Link headers.

var server = restify.createServer({
    name: "Armory Auth",
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
    res.send("You are authenticated!");
});

server.listen(8080);