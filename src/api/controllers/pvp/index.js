// @flow

import type { Models } from 'flowTypes';

import * as userService from 'lib/services/user';
import { list as listPvpStandings } from 'lib/services/pvpStandings';
import gw2, { readLatestPvpSeason } from 'lib/gw2';

const handleBadToken = (defaultValue, error) => {
  if (error === 'Token not found' || (error.data && error.data.text === 'requires scope pvp')) {
    return defaultValue;
  }

  throw error;
};

export default function pvpControllerFactory (models: Models) {
  const readPrimaryToken = async (alias) => {
    const user = await userService.read(models, { alias });
    if (!user || !user.token) {
      throw new Error('Token not found');
    }

    return user.token;
  };

  async function stats (alias: string) {
    return readPrimaryToken(alias)
      .then((token) => gw2.readPvpStats(token))
      .catch(handleBadToken.bind(null, {}));
  }

  function games (alias: string) {
    return readPrimaryToken(alias)
      .then((token) => gw2.readPvpGames(token))
      .catch(handleBadToken.bind(null, []));
  }

  function standings (alias: string) {
    return readPrimaryToken(alias)
      .then((token) => gw2.readPvpStandings(token))
      .catch(handleBadToken.bind(null, []));
  }

  function achievements (alias: string) {
    return readPrimaryToken(alias)
      .then((token) => gw2.readAchievements(token))
      .catch(handleBadToken.bind(null, []));
  }

  type LeaderboardRegion = 'gw2a' | 'na' | 'eu';

  async function leaderboard (region: LeaderboardRegion) {
    const season = await readLatestPvpSeason();
    const pvpStandings = await listPvpStandings(models, season.id, region);
    return pvpStandings;
  }

  return {
    stats,
    games,
    standings,
    achievements,
    leaderboard,
  };
}
