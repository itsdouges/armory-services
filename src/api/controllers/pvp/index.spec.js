import * as testData from 'test/testData';
import _ from 'lodash';

const readPvpStats = sinon.stub();
const readPvpGames = sinon.stub();
const readPvpStandings = sinon.stub();
const readAchievements = sinon.stub();
const listUserStandings = sinon.stub();
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
    list: listUserStandings,
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
    const apiToken = '1234-1234';
    const user = testData.user({
      token: apiToken,
      accountName: 'yes',
    });

    const createStanding = (rank) => testData.dbStanding({
      apiToken,
      seasonId: season.seasonId,
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
      three,
      five,
      one,
      four,
    ];

    const cleanStanding = (standing) => ({
      ..._.omit(standing, ['apiToken']),
      accountName: user.accountName,
      alias: user.alias,
    });

    const sorted = [
      cleanStanding(one),
      cleanStanding(two),
      cleanStanding(three),
      cleanStanding(four),
      cleanStanding(five),
    ];

    beforeEach(() => {
      readUser.withArgs(models, { apiToken }).returns(Promise.resolve(user));
      listUserStandings.withArgs(models, season.id).returns(Promise.resolve(standings));
    });

    it('should return maxium of 250', async () => {
      const longStandings = Array(300).fill(one);
      listUserStandings.withArgs(models, season.id).returns(Promise.resolve(longStandings));
      const leaderboard = await controller.leaderboard('gw2a');

      expect(leaderboard.length).to.equal(250);
    });

    describe('pagination', () => {
      it('should return 50 records', () => {
        // TODO, later !
      });
    });

    context('gw2a', () => {
      it('should build leaderboard and sort by highest to lowest rating', async () => {
        const leaderboard = await controller.leaderboard('gw2a');

        expect(leaderboard).to.eql(sorted);
      });
    });

    context('na', () => {
      it('should build leaderboard and sort by highest to lowest rating', async () => {
        const leaderboard = await controller.leaderboard('na');

        expect(leaderboard).to.eql(sorted);
      });
    });

    context('eu', () => {
      it('should build leaderboard and sort by highest to lowest rating', async () => {
        const leaderboard = await controller.leaderboard('eu');

        expect(leaderboard).to.eql(sorted);
      });
    });
  });
});
