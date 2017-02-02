// @flow

export default {
  api: {
    publicUrl: 'https://api.gw2armory.com',
  },

  db: {
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'password',
    host: 'gw2armory-prod.cekbcmynaoxp.us-east-1.rds.amazonaws.com',
  },

  web: {
    publicUrl: 'https://gw2armory.com',
  },
};
