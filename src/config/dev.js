// @flow

import { minutes } from 'lib/time';

export default {
  db: {
    host: process.env.DB_PORT_3306_TCP_ADDR,
  },

  leaderboards: {
    latestSeasonCacheTtl: minutes(1),
    refreshInterval: minutes(1),
    getCacheTtl: minutes(1),
  },

  fetch: {
    interval: minutes(1),
    disabled: false,
  },

  cache: {
    findAllCharacters: minutes(1),
    statistics: minutes(1),
  },

  web: {
    publicUrl: 'http://localhost:3000',
  },
};
