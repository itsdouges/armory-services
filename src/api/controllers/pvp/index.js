// @flow

import type { Models } from 'flowTypes';
import memoize from 'memoizee';

import * as userService from 'lib/services/user';
import { list as listPvpStandings } from 'lib/services/pvpStandings';
import gw2, { readLatestPvpSeason } from 'lib/gw2';
import config from 'config';

const handleBadToken = (defaultValue, error) => {
  if (error === 'Token not found' || (error.data && error.data.text === 'requires scope pvp')) {
    return defaultValue;
  }

  throw error;
};

export default function pvpControllerFactory (models: Models) {
  function stats (alias: string) {
    return userService.getUserPrimaryToken(models, alias)
      .then((token) => {
        return gw2.readPvpStats(token);
      })
      .catch(handleBadToken.bind(null, {}));
  }

  function games (alias: string) {
    return userService.getUserPrimaryToken(models, alias)
      .then((token) => {
        return gw2.readPvpGames(token);
      })
      .catch(handleBadToken.bind(null, []));
  }

  function standings (alias: string) {
    return userService.getUserPrimaryToken(models, alias)
      .then((token) => {
        return gw2.readPvpStandings(token);
      })
      .catch(handleBadToken.bind(null, []));
  }

  function achievements (alias: string) {
    return userService.getUserPrimaryToken(models, alias)
      .then((token) => {
        return gw2.readAchievements(token);
      })
      .catch(handleBadToken.bind(null, []));
  }

  const memoizedReadLatestPvpSeason = memoize(readLatestPvpSeason, {
    maxAge: config.leaderboards.latestSeasonCacheTtl,
    promise: true,
    preFetch: true,
  });

  async function leaderboard () {
    const season = await memoizedReadLatestPvpSeason();

    const pvpStandings = await listPvpStandings(models, season.id);

    const users = await Promise.all(pvpStandings.map((standing) => {
      return userService.read(models, { apiToken: standing.apiToken });
    }));

    const userMap = users.reduce((obj, { apiToken, ...user }) => {
      // eslint-disable-next-line
      obj[apiToken] = user;
      return obj;
    }, {});

    const pvpStandingsWithUser = pvpStandings
      .map(({ apiToken, ...standing }) => ({
        ...standing,
        ...userMap[apiToken],
      }))
      .sort((a, b) => (a.gw2aRank - b.gw2aRank));

    return pvpStandingsWithUser;
  }

  return {
    stats,
    games,
    standings,
    achievements,
    leaderboard,
  };
}
