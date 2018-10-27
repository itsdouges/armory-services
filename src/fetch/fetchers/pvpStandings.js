// @flow

import type { Models } from 'flowTypes';
import type { Fetcher$Token } from 'fetch/userFetch';

import { saveList } from 'lib/services/pvpStandings';
import gw2 from 'lib/gw2';

export default async function fetchPvpStandings(
  models: Models,
  { token, id, permissions }: Fetcher$Token
) {
  if (!permissions.includes('pvp')) {
    return Promise.resolve();
  }

  const standings = await gw2.readPvpStandings(token);

  const mappedStandings = standings.map(standing => ({
    apiTokenId: id,
    seasonId: standing.season_id,

    totalPointsCurrent: standing.current.total_points,
    divisionCurrent: standing.current.division,
    pointsCurrent: standing.current.points,
    repeatsCurrent: standing.current.repeats,
    ratingCurrent: standing.current.rating,
    decayCurrent: standing.current.decay,

    totalPointsBest: standing.best.total_points,
    divisionBest: standing.best.division,
    pointsBest: standing.best.points,
    repeatsBest: standing.best.repeats,
    ratingBest: standing.best.rating,
    decayBest: standing.best.decay,
  }));

  return await saveList(models, mappedStandings);
}
