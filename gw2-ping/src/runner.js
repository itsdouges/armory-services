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


// TODO:
// - get gw2token table
// - iterate through data, get all characters
// + IF call returns a 401 or a 403 invalidate the token on the db (valid=false, remove all characters)
// - iterate through all characters and ping their endpoints
// - save relevant data to the db
// DONE!