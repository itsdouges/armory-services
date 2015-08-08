"use strict";

var db = require('./data');

var restify = require("restify");

var server = restify.createServer({
    name: "armory.net.au:characters",
    version: require("../package.json").version
});

var RESOURCES = Object.freeze({
    INITIAL: "/",
    CHARACTERS: "/characters"
});

server.use(restify.authorizationParser());
server.use(restify.bodyParser({ 
    mapParams: false 
}));

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

server.listen(8081);