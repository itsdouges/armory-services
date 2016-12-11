import 'babel-polyfill';

const Sequelize = require('sequelize');
const Models = require('./models');
const serverFactory = require('./server');

const config = require(`${__dirname}/../config`);

console.log(`\n=== Connecting to mysql host: ${config.db.host} ===\n`);

const db = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
const models = new Models(db);
const server = serverFactory(models, config);

console.log('\n=== Syncing sequelize models... ===\n');

models.sequelize.sync()
  .then(() => {
    console.log(`\n=== Starting server on port ${config.server.port}... ===\n`);
    server.listen(config.server.port);
  });
