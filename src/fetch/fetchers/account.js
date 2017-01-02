const _ = require('lodash');

const gw2 = require('lib/gw2');
const guildsService = require('lib/services/guilds');

module.exports = function fetch (models, { token }) {
  return gw2
    .readAccount(token)
    .then((accountInfo) => {
      const row = {
        ..._.pick(accountInfo, [
          'world',
          'created',
          'access',
          'commander',
          'wvwRank',
          'monthlyAp',
          'dailyAp',
          'fractalLevel',
        ]),
        guilds: accountInfo.guilds && accountInfo.guilds.join(','),
      };

      return Promise.all([
        guildsService.fetch(models, accountInfo.guilds),
        models.Gw2ApiToken.update(row, {
          where: {
            token,
          },
        }),
      ]);
    });
};
