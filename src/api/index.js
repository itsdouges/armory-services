// @flow
/* eslint import/imports-first:off */

import '../base';

import { models, sync } from 'lib/db';
import config from 'config';
import createLog from 'lib/logger';
import createServer from './server';

const logger = createLog('api', 'api');
const server = createServer(models);

sync().then(() => {
  server.listen(config.api.port);
  logger.log(':wave:');
});

process.on('unhandledRejection', (err) => {
  logger.error(err);
});

process.on('uncaughtException', (err) => {
  logger.error(err);
  throw err;
});
