var Controller = require('./controllers/ping-controller'),
	Models = require("./models"),
	Sequelize = require("sequelize"),
	axios = require('axios'),
	fetchGw2 = require('./services/fetch-gw2');

var config = require(__dirname + '/../env/env_config');
config.db.options.host = process.env[config.db.options.host_env_name];

console.log('Connecting to mysql host: ' + config.db.options.host);
var db = new Sequelize(config.db.name, config.db.user, config.db.password, config.db.options);
var models = new Models(db);
var pinger = new Controller(config, axios, models, fetchGw2);

console.log('Starting ping..');
pinger.ping();
setInterval(function () {
	pinger.ping();
}, config.ping.interval);