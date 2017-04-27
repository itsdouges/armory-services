// @flow

import { hours, minutes } from 'lib/time';

export default {
  api: {
    publicUrl: 'https://api.gw2armory.com',
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
    '*',
  ],

  slack: {
    token: process.env.SLACK_BOT_TOKEN,
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
    publicUrl: 'https://gw2armory.com',
  },

  fetch: {
    concurrentCalls: 20,
    port: 8081,
    interval: hours(8),
    retries: 5,
    host: process.env.FETCH_PORT_8081_TCP_ADDR,
    refetchTimeout: hours(1),
  },

  leaderboards: {
    latestSeasonCacheTtl: hours(1),
    refreshInterval: minutes(30),
    getCacheTtl: minutes(30),
    backupLatestSeasonId: '14E58A5B-9139-4B9B-A0B7-D2B79E303332',
  },

  cache: {
    findAllCharacters: hours(1),
    statistics: hours(1),
    resourceOfTheDay: hours(24),
    gw2Api: minutes(5),
  },

  pagination: {
    guilds: 10,
    leaderboards: 250,
  },

  ofTheDay: {
    characters: 1,
    guilds: 8,
  },

  sitemap: {
    pageItemLimit: 50000,
  },

};
