// @flow
/* eslint import/imports-first:off */

import '../base';

import Sequelize from 'sequelize';
import Models from 'lib/models';
import config from 'config';
import createServer from './server';

console.log(`\n=== Connecting to mysql host: ${config.db.host} ===\n`);

const db = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);
const models = new Models(db);
const server = createServer(models, config);

console.log('\n=== Syncing sequelize models... ===\n');

models.sequelize.sync().then(() => {
  console.log(`\n=== Starting server on port ${config.api.port}... ===\n`);
  server.listen(config.api.port);
});
