const gw2 = require('../lib/gw2');
const _ = require('lodash');

module.exports = (models, { token, permissions }) => {
  if (_.includes(permissions, 'guilds')) {
    return gw2.account(token)
      .then(({ guildLeader } = {}) => {
        if (guildLeader) {
          const promises = guildLeader.map((guildId) => {
            return gw2.guildAuthenticated(token, guildId)
              .then((data) => {
                return models.Gw2Guild.update(Object.assign({}, {
                  apiToken: token,
                }, data), {
                  where: {
                    id: guildId,
                  },
                });
              });
          });

          return Promise.all(promises);
        }

        return undefined;
      });
  }

  return Promise.resolve();
};
