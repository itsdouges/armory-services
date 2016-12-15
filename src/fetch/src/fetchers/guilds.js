import _ from 'lodash';
import gw2 from '../lib/gw2';

export default async function guildsFetcher (models, { token, permissions }) {
  if (!_.includes(permissions, 'guilds')) {
    return;
  }

  const { guildLeader } = await gw2.account(token);
  if (!guildLeader) {
    return;
  }

  const promises = guildLeader.map(async (guildId) => {
    const data = await gw2.guildAuthenticated(token, guildId);

    await models.Gw2Guild.upsert({
      ...data,
      apiToken: token,
      id: guildId,
    });
  });

  await Promise.all(promises);
}
