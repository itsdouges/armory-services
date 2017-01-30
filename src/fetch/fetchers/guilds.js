// @flow

import type { Models } from 'flowTypes';
import type { Fetcher$Token } from 'fetch/tokenFetch';

import _ from 'lodash';
import gw2 from 'lib/gw2';
import { bulkCreateStubUser } from 'lib/services/user';

export default async function guildsFetcher (
  models: Models,
  { token, id, permissions }: Fetcher$Token
) {
  if (!_.includes(permissions, 'guilds')) {
    return undefined;
  }

  const { guildLeader } = await gw2.readAccount(token);
  if (!guildLeader) {
    return undefined;
  }

  const promises = guildLeader.map(async (guildId) => {
    const [data, members] = await Promise.all([
      gw2.readGuild(token, guildId),
      gw2.readGuildMembers(token, guildId),
    ]);

    await Promise.all([
      bulkCreateStubUser(models, members.map(({ name }) => ({
        accountName: name,
        guilds: [guildId],
      }))),
      models.Gw2Guild.upsert({
        ...data,
        id: guildId,
        apiTokenId: id,
      }),
    ]);
  });

  return await Promise.all(promises);
}
