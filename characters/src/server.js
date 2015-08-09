"use strict";

var restify = require("restify");
var Sequelize = require('sequelize');

// TODO: Instantiate sql client + Controller.

var server = restify.createServer({
    name: "armory.net.au:characters",
    version: require("../package.json").version
});

var RESOURCES = Object.freeze({
    INITIAL: "/",
    CHARACTERS: "/characters"
});

server.get(RESOURCES.INITIAL, function (req, res) {
    var response = "Characters endpoint for armory.net.au";

    res.contentType = "application/json";
    res.send(response);
});

server.get(RESOURCES.CHARACTERS, function (req, res) {
    res.send('ayy lmao characters');
});

server.listen(8081);