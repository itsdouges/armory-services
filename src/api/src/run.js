var Models = require("./models");
var Server = require('./server');
var Sequelize = require("sequelize");

var config = require(__dirname + '/../env/env_config');
config.ping.host = process.env[config.ping.host_env_name];

if (!config.db.options.host) {
    config.db.options.host = process.env[config.db.options.host_env_name];
}

console.log('Connecting to mysql host: ' + config.db.options.host);
var db = new Sequelize(config.db.name, config.db.user, config.db.password, config.db.options);
var models = new Models(db);
var server = Server(models, config);

console.log('Syncing sequelize models..');
models.sequelize.sync().then(function () {
    console.log('Starting server on port ' + config.server.port + '..');
    server.listen(config.server.port);
});