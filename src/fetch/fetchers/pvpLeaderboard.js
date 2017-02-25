// @flow

import type { Models } from 'flowTypes';

import _ from 'lodash';

import gw2, { readLatestPvpSeason } from 'lib/gw2';
import { bulkCreateStubUser } from 'lib/services/user';
import { saveList as saveStandings, list as listPvpStandings } from 'lib/services/pvpStandings';
import createLogger from 'lib/gitter';
import buildLadderByAccountName from '../lib/leaderboardBuilder';

const logger = createLogger('Pvp_leaderboard');

const hasJoined = (standing) => !!standing.totalPointsBest;

const sortByRating = (a, b) => {
  const aJoined = hasJoined(a);
  const bJoined = hasJoined(b);

  // A hasn't joined the armory, B has
  if (!aJoined && bJoined) {
    return 1;
  }

  // B hasn't joined the armory, A has
  if (!bJoined && aJoined) {
    return -1;
  }

  // Both haven't joined the armory.
  if (!aJoined && !bJoined) {
    return 0;
  }

  // Both have joined the armory.
  return (b.ratingCurrent - b.decayCurrent) - (a.ratingCurrent - a.decayCurrent);
};

async function addMissingUsers (models, ladder) {
  const users = ladder.map(({ name }) => ({ accountName: name }));
  return await bulkCreateStubUser(models, users);
}

const mergeLadders = ({ standings, na, eu }) => {
  const key = 'apiTokenId';
  const standingsMap = _.keyBy(standings, key);
  const naMap = _.keyBy(na, key);
  const euMap = _.keyBy(eu, key);

  const mergedStandings = _.merge(
    standingsMap,
    naMap,
    euMap,
  );

  return _.values(mergedStandings);
};

const clearRanks = (standings) => standings.map((standing) => ({
  ...standing,
  euRank: null,
  naRank: null,
  gw2aRank: null,
}));

const buildStandings = ({ standings, na, eu }) => {
  const cleanedStandings = clearRanks(standings);

  return mergeLadders({ standings: cleanedStandings, na, eu })
    .sort(sortByRating)
    .map((standing, index) => ({
      ...standing,
      gw2aRank: hasJoined(standing) ? index + 1 : null,
    }));
};

export default async function calculatePvpLeaderboards (models: Models) {
  logger.start();

  const season = await readLatestPvpSeason();

  const [naLadder, euLadder, standings] = await Promise.all([
    gw2.readPvpLadder(null, season.id, { region: 'na' }),
    gw2.readPvpLadder(null, season.id, { region: 'eu' }),
    listPvpStandings(models, season.id),
  ]);

  const newUsersResults = await addMissingUsers(models, naLadder.concat(euLadder));

  const [na, eu] = await Promise.all([
    buildLadderByAccountName(models, naLadder, { key: 'naRank', seasonId: season.id }),
    buildLadderByAccountName(models, euLadder, { key: 'euRank', seasonId: season.id }),
  ]);

  const compiledStandings = buildStandings({ standings, na, eu });

  const saveResults = await saveStandings(models, compiledStandings);

  logger.finish([].concat(
    newUsersResults,
    saveResults
  ));
}
