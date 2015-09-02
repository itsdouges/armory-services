var Controller = require('./controllers/ping-controller'),
	Models = require("./models"),
	Sequelize = require("sequelize"),
	axios = require('axios');

var config = require(__dirname + '/../env/env_config');
config.db.options.host = process.env[config.db.options.host_env_name];

console.log('Connecting to mysql host: ' + config.db.options.host);
var db = new Sequelize(config.db.name, config.db.user, config.db.password, config.db.options);
var models = new Models(db);
var pinger = new Controller(config.ping, axios, models);

console.log('Starting ping..');
pinger.ping();
setInterval(function () {
	pinger.ping();
}, config.ping.interval);

// TODO:
// - get gw2token table
// - iterate through data, get all characters
// + IF call returns a 401 or a 403 invalidate the token on the db (valid=false, remove all characters)
// - iterate through all characters and ping their endpoints
// - save relevant data to the db
// DONE!