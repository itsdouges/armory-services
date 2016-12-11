import { isAccessAllowed } from '../../services/guild';
import { isUserInGuild } from '../../services/user';

export default function canAccess (models, type, user) {
  return Promise.all([
    isAccessAllowed(models, type),
    isUserInGuild(models, user),
  ])
  .then(([publicAccessAllowed, userIsInGuild]) => {
    return userIsInGuild || publicAccessAllowed ?
      Promise.resolve() :
      Promise.reject('Access not allowed');
  });
}
