import { isAccessAllowed } from '../../services/guild';
import { isUserInGuild } from '../../services/user';

export default async function canAccess (models, { guildName, type, email }) {
  const [publicAccessAllowed, userIsInGuild] = await Promise.all([
    isAccessAllowed(models, type),
    isUserInGuild(models, email, guildName),
  ]);

  return !!(userIsInGuild || publicAccessAllowed);
}
