// @flow
/* eslint import/imports-first:off */

import { models, sync } from '../base';
import config from 'config';
import createServer from './server';

const server = createServer(models, config);

sync().then(() => server.listen(config.api.port));
