import * as testData from 'test/testData';

const readPvpStats = sinon.stub();
const readPvpGames = sinon.stub();
const readPvpStandings = sinon.stub();
const readAchievements = sinon.stub();
const listPvpStandings = sinon.stub();
const getUserPrimaryToken = sinon.stub();
const readUser = sinon.stub();

const season = testData.pvpSeason();
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

  it('should return pvp data for primary token', async () => {
    const data = { neat: 'data' };
    readPvpStats.withArgs(token).returns(data);

    const stats = await controller.stats(alias);

    expect(stats).to.equal(data);
  });

  it('should return pvp games for primary token', async () => {
    const data = { neat: 'data' };
    readPvpGames.withArgs(token).returns(data);

    const games = await controller.games(alias);

    expect(games).to.equal(data);
  });

  it('should return pvp standings for primary token', async () => {
    const data = { neat: 'data' };
    readPvpStandings.withArgs(token).returns(data);

    const standings = await controller.standings(alias);

    expect(standings).to.equal(data);
  });

  it('should return pvp achievements for primary token', async () => {
    const data = { neat: 'data' };
    readAchievements.withArgs(token).returns(data);

    const achievements = await controller.achievements(alias);

    expect(achievements).to.equal(data);
  });

  describe('leaderboard', () => {
    const apiTokenId = 3;
    const user = testData.user({
      tokenId: apiTokenId,
      alias: 'madou',
      accountName: 'madou.1234',
    });

    const createStanding = (rank) => testData.dbStanding({
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

    const assertIsSorted = (arr, key) => {
      const fromOneArr = arr.slice(1);
      fromOneArr.forEach((item, index) => {
        const prevItem = arr[index];
        expect(item[key] >= prevItem[key]).to.be.true;
      });
    };

    const assertUsers = (leaderboard) => {
      leaderboard.forEach((standing) => {
        expect(standing).to.include({
          alias: user.alias,
          accountName: user.accountName,
        });
      });
    };

    beforeEach(() => {
      readUser.withArgs(models, { apiTokenId }).returns(Promise.resolve(user));
    });

    ['na', 'gw2a', 'eu'].forEach((region) => {
      beforeEach(() => {
        listPvpStandings.withArgs(models, season.id, region).returns(Promise.resolve(standings));
      });

      describe(region, () => {
        it('should return maxium of 250', async () => {
          const longStandings = Array(300).fill(one);
          listPvpStandings
            .withArgs(models, season.id, region)
            .returns(Promise.resolve(longStandings));
          const leaderboard = await controller.leaderboard(region);

          expect(leaderboard.length).to.equal(250);
        });

        it('should build leaderboard and sort by highest to lowest rating', async () => {
          const leaderboard = await controller.leaderboard(region);

          assertIsSorted(leaderboard, `${region}Rank`);
        });

        it('should add user data to each standing', async () => {
          const leaderboard = await controller.leaderboard(region);

          assertUsers(leaderboard);
        });
      });
    });
  });
});
