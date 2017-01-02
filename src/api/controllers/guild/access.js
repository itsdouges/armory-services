import { isAccessAllowed } from 'lib/services/guild';
import { isUserInGuild } from 'lib/services/user';

export default async function canAccess (models, { guildName, type, email }) {
  const [publicAccessAllowed, userIsInGuild] = await Promise.all([
    isAccessAllowed(models, type, guildName),
    isUserInGuild(models, email, guildName),
  ]);

  return !!(userIsInGuild || publicAccessAllowed);
}
