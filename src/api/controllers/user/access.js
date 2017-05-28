// @flow

import type { Models } from 'flowTypes';

type Options = {
  type: string,
  alias?: string,
  email?: string,
};

export default async function canAccess (models: Models, { alias, type, email }: Options) {
  return Promise.resolve(true);
}
