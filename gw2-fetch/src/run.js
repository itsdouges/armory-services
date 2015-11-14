var Controller = require('./controllers/ping-controller'),
	Models = require("./models"),
	Sequelize = require("sequelize"),
	axios = require('axios'),
	fetchGw2 = require('./services/fetch-gw2')
	http = require('http'),
	restify = require("restify");

var config = require(__dirname + '/../env/env_config');

if (!config.db.options.host) {
	config.db.options.host = process.env[config.db.options.host_env_name];
}

console.log('Connecting to mysql host: ' + config.db.options.host);
var db = new Sequelize(config.db.name, config.db.user, config.db.password, config.db.options);
var models = new Models(db);
var pinger = new Controller(config, axios, models, fetchGw2);

var server = restify.createServer({
    name: "gw2-fetch"
});

server.use(restify.bodyParser());

server.get('/', function (req, res, next) {
	res.send('I am alive');
	return next();
});

server.post('/fetch-characters', function (req, res, next) {
	console.log('Single fetch triggered for', req.params.token);

	pinger.fetchUserCharacterData(req.params.token)
		.then(function () {
	    res.send(200);
	    return next();
		}, function (err) {
			res.send(500, err);
			return next();
		});
});

models.sequelize.sync().then(function () {
	console.log('Starting server on port ' + config.ping.port + '..');
	server.listen(config.ping.port);

	console.log('Starting ping..');
	
	pinger.ping();
	setInterval(function () {
		pinger.ping();
	}, config.ping.interval);
});

