import * as testData from 'test/testData/db';

const service = proxyquire('lib/services/pvpStandings', {});

describe('pvp standings service', () => {
  const user = testData.user();
  const apiToken = testData.apiToken();
  const standings = [{
    seasonId: 's1',
    ratingCurrent: 100,
    decayCurrent: 100,
  }, {
    seasonId: 's2',
    ratingCurrent: 1500,
    decayCurrent: 500,
  }, {
    seasonId: 's3',
    ratingCurrent: 2000,
    decayCurrent: 1500,
  }, {
    seasonId: 's4',
    ratingCurrent: 1100,
    decayCurrent: 0,
  }].map((standing) => (testData.standing(standing)));

  let models;

  before(async () => {
    models = await setupTestDb();
    await models.User.create(user);
    await models.Gw2ApiToken.create(apiToken);
  });

  it('should save a list standings into the database', async () => {
    await service.saveList(models, standings);

    const standingsInDb = await models.PvpStandings.findAll();

    expect(standingsInDb.length).to.equal(standings.length);

    standingsInDb.forEach((standing, index) => {
      expect(standing).to.include(standings[index]);
    });
  });

  it('should read all user standings for a season', async () => {
    const standingOne = testData.standing({
      apiToken: apiToken.id,
    });

    const latestStanding = {
      ...standingOne,
      ratingCurrent: 2222,
      gw2aRank: 3,
      naRank: 4,
      euRank: 55,
    };

    await models.PvpStandings.create(latestStanding);

    const actual = await service.list(models, standingOne.seasonId, 'gw2a');

    expect(actual[0]).to.eql({
      accountName: apiToken.accountName,
      alias: user.alias,
      gw2aRank: latestStanding.gw2aRank,
      naRank: latestStanding.naRank,
      euRank: latestStanding.euRank,
      ratingCurrent: latestStanding.ratingCurrent,
      seasonId: standingOne.seasonId,
      totalPointsBest: latestStanding.totalPointsBest,
      apiTokenId: apiToken.id,
      decayCurrent: latestStanding.decayCurrent,
      wins: latestStanding.wins,
      losses: latestStanding.losses,
    });
  });
});
