// @flow

import type { Models, Gw2LadderStanding } from 'flowTypes';

import { read as readUser } from 'lib/services/user';

type Standing = {
  apiTokenId: number,
  seasonId: string,
  ['naRank' | 'euRank']: number,
  ratingCurrent: number,
  kills: number,
  deaths: number,
};

type Options = {
  key: 'naRank' | 'euRank',
  seasonId: string,
};

export default async function buildLadderByAccountName (
  models: Models,
  ladder: Array<Gw2LadderStanding>, {
    key,
    seasonId,
  }: Options,
): Promise<Array<Standing>> {
  const users = await Promise.all(
    ladder.map(({ name }) => readUser(models, { accountName: name }))
  );

  return users
    .filter((user) => !!user)
    .map((user, index) => ({
      apiTokenId: user && user.tokenId ? user.tokenId : -1,
      [key]: ladder[index].rank,
      seasonId,

      // KLUDGE: Dynamically find these instead of looking at the array.
      ratingCurrent: ladder[index].scores[0].value,
      kills: ladder[index].scores[1].value,
      deaths: ladder[index].scores[2].value,
    }));
}
