import * as testData from 'test/testData';

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
  }].map((standing) => (testData.dbStanding(standing)));

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
    const standingOne = testData.dbStanding({
      apiToken: apiToken.token,
    });

    await models.PvpStandings.create(standingOne);

    const actual = await service.list(models, standingOne.seasonId);

    expect(actual).to.eql([
      standingOne,
    ]);
  });
});
