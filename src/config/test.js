// @flow

import { minutes } from 'lib/time';

export default {
  db: {
    host: 'gw2armory-test.cekbcmynaoxp.us-east-1.rds.amazonaws.com',
  },

  fetch: {
    interval: minutes(1),
  },
};
