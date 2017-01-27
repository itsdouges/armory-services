// @flow
/* eslint import/imports-first:off */

import '../base';
import config from 'config';
import Sequelize from 'sequelize';
import Models from 'lib/models';
import { argv } from 'yargs';

async function sync () {
  const db = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    config.db
  );

  const models = new Models(db);

  console.log('Syncing database...');
  await models.sequelize.sync({ force: true });
  console.log('Done!');
}

if (argv.sync) {
  sync();
}
