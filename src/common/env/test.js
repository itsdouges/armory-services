/* THIS IS COPIED FROM COMMON/ENV */

module.exports = {
  db: {
    database: 'armory',
    username: 'admin',
    password: 'password',
    dialect: 'mysql',
    host: 'gw2armory-migration-test.cekbcmynaoxp.us-east-1.rds.amazonaws.com',
  },
  ping: {
    port: '8081',
    interval: 480 * 60000, // [min] * 60000
    retries: 5,
    verbose: true,
    host: process.env.FETCH_PORT_8081_TCP_ADDR,
  },
};
