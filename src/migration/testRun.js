// @flow
/* eslint import/imports-first:off */

import '../base';
import config from 'config';
import Sequelize from 'sequelize';
import Models from 'lib/models';

const db = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db
);

const models = new Models(db);

console.log('Syncing database...');
models.sequelize.sync({ force: true })
  .then(() => console.log('Done!'));
