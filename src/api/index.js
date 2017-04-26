// @flow
/* eslint import/imports-first:off */

import '../base';

import { models, sync } from 'lib/db';
import config from 'config';
import createLog from 'lib/logger';
import createServer from './server';

const server = createServer(models, config);

sync().then(() => {
  server.listen(config.api.port);
  createLog('api', 'api').log(':wave:');
});
