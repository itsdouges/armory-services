// @flow

import type { Models } from 'flowTypes';

import _ from 'lodash';

import gw2, { readLatestPvpSeason } from 'lib/gw2';
import { read as readUser, createStubUser } from 'lib/services/user';
import { saveList as saveStandings, list as listStandings } from 'lib/services/pvpStandings';
import buildLadderByAccountName from '../lib/leaderboard';

const sortByRating = (a, b) => {
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
    await Promise.all(
      newUsers.map((accountName) => createStubUser(models, accountName))
    );
  }
}

const mergeLadders = ({ standings, na, eu }) => {
  const key = 'apiToken';
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
      gw2aRank: standing.ratingCurrent ? index + 1 : null,
    }));

  await saveStandings(models, sortedStandings);
}

export default async function calculatePvpLeaderboards (models: Models) {
  const season = await readLatestPvpSeason();

  const [naLadder, euLadder, standings] = await Promise.all([
    gw2.readPvpLadder(null, season.id, { region: 'na' }),
    gw2.readPvpLadder(null, season.id, { region: 'eu' }),
    listStandings(models, season.id),
  ]);

  await addMissingUsers(models, naLadder.concat(euLadder));

  const [na, eu] = await Promise.all([
    buildLadderByAccountName(models, naLadder),
    buildLadderByAccountName(models, euLadder),
  ]);

  await saveLadder(models, { standings, na, eu });
}
