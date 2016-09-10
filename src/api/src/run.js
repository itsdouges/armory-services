var Models = require("./models");
var Server = require('./server');
var Sequelize = require("sequelize");

var config = require(__dirname + '/../env');

console.log('Connecting to mysql host: ' + config.db.host);
var db = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
var models = new Models(db);
var server = Server(models, config);

console.log('Syncing sequelize models..');
models.sequelize.sync().then(function () {
  console.log('Starting server on port ' + config.server.port + '..');
  server.listen(config.server.port);
});
