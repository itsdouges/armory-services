import * as testData from 'test/testData';

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
  memoizee: (func) => func,
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

    readUser.withArgs(models, { alias }).returns(Promise.resolve({ apiToken: { token } }));

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
    it('should build leaderboard and sort by highest to lowest rating', async () => {
      const apiToken = '1234-1234';
      const user = {
        accountName: 'madou.1234',
        alias: 'madou',
        apiToken,
      };

      const standings = [
        { seasonId: season.season_id, apiToken, gw2aRank: 2, decayCurrent: 700 },
        { seasonId: season.season_id, apiToken, gw2aRank: 1, decayCurrent: 100 },
      ];

      readUser.withArgs(models, { apiToken }).returns(Promise.resolve(user));
      listUserStandings.withArgs(models).returns(Promise.resolve(standings));

      const leaderboard = await controller.leaderboard();

      expect(leaderboard).to.eql([{
        accountName: user.accountName,
        alias: user.alias,
        gw2aRank: 1,
        decayCurrent: 100,
        seasonId: season.season_id,
      }, {
        accountName: user.accountName,
        alias: user.alias,
        gw2aRank: 2,
        decayCurrent: 700,
        seasonId: season.season_id,
      }]);
    });
  });
});
