// @flow

import type { Models } from 'flowTypes';

import _ from 'lodash';
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

  type LeaderboardType = 'gw2a' | 'na' | 'eu';

  async function leaderboard (type: LeaderboardType) {
    const season = await readLatestPvpSeason();

    const pvpStandings = await listPvpStandings(models, season.id);

    const users = await Promise.all(pvpStandings.map((standing) => {
      return userService.read(models, { apiToken: standing.apiToken });
    }));

    const userMap = users.reduce((obj, { token, ...user } = {}) => {
      // eslint-disable-next-line
      obj[token] = user;
      return obj;
    }, {});

    const pvpStandingsWithUser = pvpStandings
      .map(({ apiToken, ...standing }) => ({
        ...standing,
        ..._.pick(userMap[apiToken], [
          'accountName',
          'alias',
        ]),
      }))
      .sort((a, b) => a[`${type}Rank`] - b[`${type}Rank`]);

    return pvpStandingsWithUser.slice(0, 250);
  }

  return {
    stats,
    games,
    standings,
    achievements,
    leaderboard,
  };
}
