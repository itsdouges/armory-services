// @flow

import type { Models } from 'flowTypes';

import { isAccessAllowed } from 'lib/services/guild';
import { isUserInGuild } from 'lib/services/user';

type Options = {
  type: string,
  guildName: string,
  email?: string,
};

export default async function canAccess (models: Models, { guildName, type, email }: Options) {
  const [publicAccessAllowed, userIsInGuild] = await Promise.all([
    isAccessAllowed(models, type, guildName),
    isUserInGuild(models, email || '', guildName),
  ]);

  return !!(userIsInGuild || publicAccessAllowed);
}
