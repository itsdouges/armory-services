// @flow

import type { Models } from 'flowTypes';
import { readLatestPvpSeason } from 'lib/gw2';
import { saveList as saveStandings, list as listStandings } from 'lib/services/pvpStandings';

function sortByRating (a, b) {
  return (b.ratingCurrent - b.decayCurrent) - (a.ratingCurrent - a.decayCurrent);
}

export default async function calculatePvpLeaderboard (models: Models) {
  const season = await readLatestPvpSeason();

  const pvpStandings = await listStandings(models, season.id);

  const sortedStandings = pvpStandings
    .sort(sortByRating)
    .map((standing, index) => ({
      ...standing,
      gw2aRank: index + 1,
    }));

  await saveStandings(models, sortedStandings);
}
