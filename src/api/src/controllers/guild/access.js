import { isAccessAllowed } from '../../services/guild';
import { isUserInGuild } from '../../services/user';

export default async function canAccess (models, { name, type, user }) {
  const [publicAccessAllowed, userIsInGuild] = await Promise.all([
    isAccessAllowed(models, type),
    isUserInGuild(models, user, name),
  ]);

  return !!(userIsInGuild || publicAccessAllowed);
}
