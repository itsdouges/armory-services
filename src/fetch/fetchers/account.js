import _ from 'lodash';
import gw2 from 'lib/gw2';
import guildsService from 'lib/services/guilds';

export default async function fetch (models, { token }) {
  const accountInfo = await gw2.readAccount(token);
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

  return await Promise.all([
    guildsService.fetch(models, accountInfo.guilds),
    models.Gw2ApiToken.update(row, {
      where: {
        token,
      },
    }),
  ]);
}
