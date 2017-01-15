// @flow

import type { Models, Gw2LadderStanding } from 'flowTypes';

import { read as readUser } from 'lib/services/user';

type Standing = {
  apiToken: string,
  seasonId: string,
  rank: number,
};

export default async function buildLadderByAccountName (
  models: Models,
  ladder: Array<Gw2LadderStanding>
): Promise<Array<Standing>> {
  const users = await Promise.all(
    ladder.map(({ name }) => readUser(models, { accountName: name }))
  );
}
