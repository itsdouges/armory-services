/* THIS IS COPIED FROM COMMON/ENV */

module.exports = {
  db: {
    database: 'armory',
    username: 'admin',
    password: 'password',
    dialect: 'mysql',
    host: 'gw2armory-prod.cekbcmynaoxp.us-east-1.rds.amazonaws.com',
    logging: false,
  },

  ping: {
    port: '8081',
    interval: 480 * 60000, // [min] * 60000
    retries: 5,
    verbose: true,
    host: process.env.FETCH_PORT_8081_TCP_ADDR,
  },

  web: {
    publicUrl: 'https://gw2armory.com',
  },

  cache: {
    findAllCharacters: 300000,
    statistics: 60000 * 60, // 60 minutes.
  },
};
