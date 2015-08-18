var models = require("./models");
var server = require('./server');

var env = process.env.ENVIRONMENT || 'dev';
var config = require(__dirname + '/../env/' + env + '.json');

models.sequelize.sync().then(function () {
	console.log('Starting server on port ' + config.port + '..');
  	server.listen(config.port);
});