// @flow

import type { Models } from 'flowTypes';
import type { Fetcher$Token } from 'fetch/tokenFetch';

import _ from 'lodash';
import gw2 from 'lib/gw2';

export default async function guildsFetcher (
  models: Models,
  { token, id, permissions }: Fetcher$Token
) {
  if (!_.includes(permissions, 'guilds')) {
    return;
  }

  const { guildLeader } = await gw2.readAccount(token);
  if (!guildLeader) {
    return;
  }

  const promises = guildLeader.map(async (guildId) => {
    const data = await gw2.readGuild(token, guildId);

    await models.Gw2Guild.upsert({
      ...data,
      id: guildId,
      apiTokenId: id,
    });
  });

  await Promise.all(promises);
}
