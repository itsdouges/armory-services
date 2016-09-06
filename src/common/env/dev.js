module.exports = {
  db: {
    name: 'armory',
    user: 'admin',
    password: 'password',
    options: {
      dialect: 'mysql',
      // host: "test-migration.cekbcmynaoxp.us-east-1.rds.amazonaws.com",
      host_env_name: 'DB_PORT_3306_TCP_ADDR',
    },
  },
  server: {
    port: '80',
  },
  gw2: {
    endpoint: 'https://api.guildwars2.com/',
  },
  jwt_tokens: {
    secret: 'im-secret',
    expires_in: 60,
  },
  ping: {
    port: '8081',
    interval: 1 * 60000, // [min] * 60000
    retries: 5,
    verbose: true,
    host_env_name: 'FETCH_PORT_8081_TCP_ADDR',
  },
  allowed_cors: [
    '*',
  ],
};
