// @flow

import type { Models } from 'flowTypes';

import _ from 'lodash';
import throat from 'throat';

import config from 'config';
import gw2, { readLatestPvpSeason } from 'lib/gw2';
import { read as readUser, createStubUser } from 'lib/services/user';
import { saveList as saveStandings, list as listStandings } from 'lib/services/pvpStandings';
import { allSettled } from 'lib/promise';
import createLogger from 'lib/gitter';
import buildLadderByAccountName from '../lib/leaderboard';

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
  const users = await Promise.all(
    ladder.map(({ name }) => readUser(models, { accountName: name }))
  );

  const newUsers = _.zip(users, ladder)
    .filter(([user]) => !user)
    .map(([, standing]) => standing.name);

  if (newUsers.length) {
    return await allSettled(
      newUsers.map(
        throat(config.fetch.concurrentCalls, (accountName) => createStubUser(models, accountName))
      )
    );
  }

  return [];
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

async function saveLadder (models, { standings, na, eu }) {
  const sortedStandings = mergeLadders({ standings, na, eu })
    .sort(sortByRating)
    .map((standing, index) => ({
      ...standing,
      gw2aRank: hasJoined(standing) ? index + 1 : null,
    }));

  await saveStandings(models, sortedStandings);
}

export default async function calculatePvpLeaderboards (models: Models) {
  logger.start();

  const season = await readLatestPvpSeason();
  if (!season.active) {
    return;
  }

  const [naLadder, euLadder, standings] = await Promise.all([
    gw2.readPvpLadder(null, season.id, { region: 'na' }),
    gw2.readPvpLadder(null, season.id, { region: 'eu' }),
    listStandings(models, season.id),
  ]);

  const results = await addMissingUsers(models, naLadder.concat(euLadder));

  const [na, eu] = await Promise.all([
    buildLadderByAccountName(models, naLadder, { key: 'naRank', seasonId: season.id }),
    buildLadderByAccountName(models, euLadder, { key: 'euRank', seasonId: season.id }),
  ]);

  await saveLadder(models, { standings, na, eu });

  logger.finish(results);
}
