import * as testData from 'test/testData';

const sandbox = sinon.sandbox.create();
const readLatestPvpSeason = sandbox.stub();
const listStandings = sandbox.stub();
const saveStandings = sandbox.stub();

const fetcher = proxyquire('fetch/fetchers/pvpLeaderboard', {
  'lib/gw2': {
    readLatestPvpSeason,
  },
  'lib/services/pvpStandings': {
    list: listStandings,
    saveList: saveStandings,
  },
});

describe('pvp leaderboard fetcher', () => {
  const seasonId = '1234-1234-1234';
  const models = { i: 'exit' };

  const standings = [{
    ratingCurrent: 100, // 4
    decayCurrent: 100,
  }, {
    ratingCurrent: 1500, // 2
    decayCurrent: 500,
  }, {
    ratingCurrent: 2000, // 3
    decayCurrent: 1500,
  }, {
    ratingCurrent: 1100, // 1
    decayCurrent: 0,
  }].map((standing) => (testData.dbStanding(standing)));

  const standing = testData.standing({
    seasonId,
  });

  before(() => {
    readLatestPvpSeason.returns({ id: seasonId });
    listStandings.withArgs(models, seasonId).returns(standings);
  });

  const addGw2aRanking = (stnding, gw2aRank) => ({
    ...stnding,
    gw2aRank,
  });

  describe('gw2a ranking', () => {
    it('should sort standings and save', async () => {
      const [
        standingOne,
        standingTwo,
        standingThree,
        standingFour,
      ] = standings;

      await fetcher(models);

      expect(saveStandings).to.have.been.calledWith(models, [
        addGw2aRanking(standingFour, 1),
        addGw2aRanking(standingTwo, 2),
        addGw2aRanking(standingThree, 3),
        addGw2aRanking(standingOne, 4),
      ]);
    });
  });
});
