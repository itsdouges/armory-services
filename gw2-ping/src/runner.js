var Client = require('./ping').Client;
var db = require('./data');

var requestClient = require('request-promise');

var CYCLE = 600000;

var pinger = new Client({}, requestClient, db);

console.log('BEGIN PING SERVICE');

pinger.ping();

setInterval(function () {
	pinger.ping();
}, CYCLE);