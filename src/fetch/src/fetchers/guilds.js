const gw2 = require('../lib/gw2');
const _ = require('lodash');

module.exports = (models, { token, permissions }) => {
  if (_.includes(permissions, 'guilds')) {
    return gw2.account(token)
      .then(({ guild_leader } = {}) => {
        // eslint-disable-next-line camelcase
        if (guild_leader) {
          const promises = guild_leader.map((id) => {
            return models.Gw2Guild.update({
              apiToken: token,
            }, {
              where: {
                id,
              },
            });
          });

          return Promise.all(promises);
        }

        return undefined;
      });
  }

  return Promise.resolve();
};
