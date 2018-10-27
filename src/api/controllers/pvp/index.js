// @flow

import type { Models, Params } from 'flowTypes';
import _ from 'lodash';

import { list as listPvpStandings } from 'lib/services/pvpStandings';
import { readLatestPvpSeason } from 'lib/gw2';

export default function pvpControllerFactory(models: Models) {
  type LeaderboardRegion = 'gw2a' | 'na' | 'eu';

  async function leaderboard(region: LeaderboardRegion, params: Params) {
    const season = await readLatestPvpSeason(params.lang || 'en');
    const pvpStandings = await listPvpStandings(models, season.id, region, params);

    return {
      id: season.id,
      name: season.name,
      ...pvpStandings,
      rows: pvpStandings.rows.map(standing =>
        _.pick(standing, [
          'euRank',
          'gw2aRank',
          'naRank',
          'ratingCurrent',
          'seasonId',
          'wins',
          'losses',
          'alias',
          'accountName',
        ])
      ),
    };
  }

  return {
    leaderboard,
  };
}
