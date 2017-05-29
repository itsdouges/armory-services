// @flow

import type { Models } from 'flowTypes';

import { notFound } from 'lib/errors';
import { read as readUser } from 'lib/services/user';

type Options = {
  type: string,
  alias: string,
  email?: string,
};

export default async function canAccess (models: Models, { alias, type, email }: Options) {
  const user = await readUser(models, { alias });

  if (!user) {
    throw notFound();
  }

  if (user.email === email) {
    return true;
  }

  return !user.privacy || !user.privacy.includes(type);
}
