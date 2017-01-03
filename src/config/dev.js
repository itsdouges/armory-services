/* THIS IS COPIED FROM COMMON/ENV */

module.exports = {
  db: {
    host: process.env.DB_PORT_3306_TCP_ADDR,
  },

  fetch: {
    interval: 1 * 60000, // [min] * 60000
  },
};
