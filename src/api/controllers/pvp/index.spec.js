import _ from 'lodash';

import * as db from 'test/testData/db';
import * as gw2 from 'test/testData/gw2';

const readPvpStats = sinon.stub();
const readPvpGames = sinon.stub();
const readPvpStandings = sinon.stub();
const readAchievements = sinon.stub();
const listPvpStandings = sinon.stub();
const getUserPrimaryToken = sinon.stub();
const readUser = sinon.stub();

const season = gw2.pvpSeason();
const readLatestPvpSeason = () => Promise.resolve(season);

const controllerFactory = proxyquire('api/controllers/pvp', {
  'lib/gw2': {
    readPvpStats,
    readPvpGames,
    readPvpStandings,
    readAchievements,
    readLatestPvpSeason,
  },
  'lib/services/user': {
    getUserPrimaryToken,
    read: readUser,
  },
  'lib/services/pvpStandings': {
    list: listPvpStandings,
  },
});

describe('pvp controller', () => {
  const token = 'cool_token';
  const alias = 'madou';
  let controller;
  let models;

  beforeEach(async () => {
    models = await setupTestDb({
      seed: true,
      email: 'email@email.com',
      alias,
      addTokens: true,
    });

    readUser.withArgs(models, { alias }).returns(Promise.resolve({ token }));

    controller = controllerFactory(models);
  });

  describe('leaderboard', () => {
    const apiTokenId = 3;

    const createStanding = (rank) => db.standing({
      apiTokenId,
      seasonId: season.id,
      gw2aRank: rank,
      naRank: rank,
      euRank: rank,
    });

    const one = createStanding(1);
    const two = createStanding(2);
    const three = createStanding(3);
    const four = createStanding(4);
    const five = createStanding(5);

    const standings = [
      two,
      createStanding(null),
      three,
      createStanding(null),
      five,
      createStanding(null),
      one,
      createStanding(null),
      four,
    ];

    ['na', 'gw2a', 'eu'].forEach((region) => {
      beforeEach(() => {
        listPvpStandings
          .withArgs(models, season.id, region)
          .returns(Promise.resolve({ rows: standings }));
      });

      describe(region, () => {
        it('should add user data to each standing', async () => {
          const leaderboard = await controller.leaderboard(region);
          expect(leaderboard.rows).to.eql(standings.map((standing) => _.pick(standing, [
            'euRank',
            'gw2aRank',
            'naRank',
            'ratingCurrent',
            'seasonId',
            'wins',
            'losses',
            'alias',
            'accountName',
          ])));
        });
      });
    });
  });
});
