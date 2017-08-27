// @flow

import { hours } from 'lib/time';

export default {
  db: {
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'password',
    host: 'gw2armory-prod.cekbcmynaoxp.us-east-1.rds.amazonaws.com',
  },

  fetch: {
    concurrentCalls: 1,
    interval: hours(30),
    retries: 1,
  },
};
