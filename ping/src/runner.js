var Client = require('./ping').Client;
var db = require('./data');

var restify = require('restify');
var client = restify.createJsonClient({
	url: 'https://api.guildwars2.com'
});

var CYCLE = 600000;

var pinger = new Client({}, client, db);

console.log('BEGIN PINGING');

pinger.ping();
setInterval(function () {
	pinger.ping();
}, CYCLE);