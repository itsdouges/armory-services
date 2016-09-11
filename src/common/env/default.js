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
    'https://preview.gw2armory.com',
    'http://localhost:3000',
  ],
  email: {
    noreply: 'noreply@gw2armory.com',
    smtp: {
      user: process.env.SES_ACCESS_KEY_ID,
      password: process.env.SES_SECRET_ACCESS_KEY,
    },
  },
  PASSWORD_RESET_TIME_LIMIT: 5,
};
