/* THIS IS COPIED FROM COMMON/ENV */

module.exports = {
  db: {
    name: 'armory',
    user: 'admin',
    password: 'password',
    options: {
      dialect: 'mysql',
      host: process.env.DB_PORT_3306_TCP_ADDR,
    },
  },
  ping: {
    port: '8081',
    interval: 1 * 60000, // [min] * 60000
    retries: 5,
    verbose: true,
    host: process.env.FETCH_PORT_8081_TCP_ADDR,
  },
};
