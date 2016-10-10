const Sequelize = require('sequelize');
const Models = require('./models');
const serverFactory = require('./server');

const config = require(`${__dirname}/../config`);

console.log(`=== Connceting to mysql host: ${config.db.host} ===`);

const db = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
const models = new Models(db);
const server = serverFactory(models, config);

console.log('=== Syncing sequelize models.. ===');

models.sequelize.sync()
  .then(() => {
    console.log(`Starting server on port ${config.server.port}...`);
    server.listen(config.server.port);
  });
