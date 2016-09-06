/* THIS IS COPIED FROM COMMON/ENV */

module.exports = {
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
  allowed_cors: [
    'https://gw2armory.com',
    'http://localhost:3000',
  ],
};
