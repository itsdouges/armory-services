// @flow

import { hours, minutes } from 'lib/time';

export default {
  api: {
    publicUrl: 'http://localhost',
    port: '80',
  },

  db: {
    database: 'armory',
    username: 'admin',
    password: 'password',
    dialect: 'mysql',
    logging: false,
  },

  gw2: {
    endpoint: 'https://api.guildwars2.com/',
  },

  jwtTokens: {
    secret: 'im-secret',
    expiresIn: 60,
  },

  allowedCors: [
    'https://gw2armory.com',
    'https://preview.gw2armory.com',
    'http://localhost:3000',
  ],

  gitter: {
    apiKey: process.env.GITTER_API_KEY,
  },

  email: {
    noreply: 'noreply@gw2armory.com',
    smtp: {
      user: process.env.SES_ACCESS_KEY_ID,
      password: process.env.SES_SECRET_ACCESS_KEY,
    },
  },

  forgotMyPassword: {
    expiry: 5,
  },

  web: {
    publicUrl: 'http://localhost:3000',
  },

  fetch: {
    concurrentCalls: 20,
    port: 8081,
    interval: hours(8),
    retries: 5,
    host: process.env.FETCH_PORT_8081_TCP_ADDR,
  },

  leaderboards: {
    latestSeasonCacheTtl: hours(1),
    refreshInterval: minutes(30),
    getCacheTtl: minutes(30),
  },

  cache: {
    findAllCharacters: hours(1),
    statistics: hours(1),
  },

  sitemap: {
    pageLimit: 50000,
  },

};
