module.exports = {
  db: {
    host: process.env.DB_PORT_3306_TCP_ADDR,
  },

  leaderboards: {
    refreshInterval: 60000 * 1,
    getCacheTtl: 1,
  },

  fetch: {
    interval: 60000 * 3,
  },
};
