// @flow

import type { Models } from 'flowTypes';
import type { Fetcher$Token } from 'fetch/tokenFetch';

import gw2 from 'lib/gw2';

export default async function fetchPvpStandings (models: Models, { token, id }: Fetcher$Token) {
  const standings = await gw2.readPvpStandings(token);

  await Promise.all(standings.map((standing) => {
    const row = {
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
    };

    return models.PvpStandings.upsert(row);
  }));
};
