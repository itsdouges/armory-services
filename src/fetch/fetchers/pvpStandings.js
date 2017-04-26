// @flow

import type { Models } from 'flowTypes';
import type { Fetcher$Token } from 'fetch/userFetch';

// import _ from 'lodash';

import { saveList } from 'lib/services/pvpStandings';
import gw2 from 'lib/gw2';

export default async function fetchPvpStandings (models: Models, { token, id }: Fetcher$Token) {
  const [
    standings,
    // stats,
  ] = await Promise.all([
    gw2.readPvpStandings(token),
    // gw2.readPvpStats(token),
  ]);

  const mappedStandings = standings.map((standing) => ({
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

    // wins: _.get(stats, 'ladders.ranked.wins'),
    // losses: _.get(stats, 'ladders.ranked.losses'),
  }));

  return await saveList(models, mappedStandings);
};
