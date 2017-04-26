// @flow

import Sequelize from 'sequelize';
import createModels from 'lib/models';
import config from 'config';

console.log();
console.log(`>>> Connecting to mysql host: ${config.db.host}...`);
console.log();

export const db = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db
);

export const models = createModels(db);

export const sync = () => models.sequelize.sync();
