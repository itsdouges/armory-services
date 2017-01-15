// @flow

import type { Models, Gw2LadderStanding } from 'flowTypes';

import { read as readUser } from 'lib/services/user';

type Standing = {
  apiToken: string,
  rank: number,
};

export default async function buildLadderByAccountName (
  models: Models,
  ladder: Array<Gw2LadderStanding>,
): Promise<Array<Standing>> {
  const users = await Promise.all(
    ladder.map(({ name }) => readUser(models, { accountName: name }))
  );

  return users.map((user, index) => ({
    apiToken: user.token,
    rank: ladder[index].scores[0].value,
  }));
}
