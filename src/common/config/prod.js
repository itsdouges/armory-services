/* THIS IS COPIED FROM COMMON/ENV */

module.exports = {
  db: {
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'password',
    host: 'gw2armory-prod.cekbcmynaoxp.us-east-1.rds.amazonaws.com',
    logging: false,
  },

  fetch: {
    interval: 480 * 60000, // [min] * 60000
    verbose: false,
  },

  web: {
    publicUrl: 'https://gw2armory.com',
  },

  cache: {
    findAllCharacters: 60000 * 60, // 60 minutes.
    statistics: 60000 * 60, // 60 minutes.
  },
};
