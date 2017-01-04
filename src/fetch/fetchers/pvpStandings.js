// @flow

import type { Models, FetchOptions } from 'flowTypes';
import { readPvpStandings } from 'lib/gw2';

export default async function fetchPvpStandings (models: Models, { token }: FetchOptions) {
  const standings = await readPvpStandings(token);

  await Promise.all(standings.map((standing) => {
    const row = {
      seasonId: standing.seasonId,
      totalPointsCurrent: standing.current.totalPoints,
      divisionCurrent: standing.current.division,
      pointsCurrent: standing.current.points,
      repeatsCurrent: standing.current.repeats,
      ratingCurrent: standing.current.rating,
      totalPointsBest: standing.best.totalPoints,
      divisionBest: standing.best.division,
      pointsBest: standing.best.points,
      repeatsBest: standing.best.repeats,
      apiToken: token,
    };

    return models.PvpStandings.upsert(row, {
      where: {
        token,
      },
    });
  }));
};
