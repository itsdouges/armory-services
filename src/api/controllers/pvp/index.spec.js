const PvpController = require('./');

describe('pvp controller', () => {
  let models;
  let systemUnderTest;
  let mockGw2Api;

  beforeEach(() => {
    mockGw2Api = {};
    mockGw2Api.readPvpStats = sinon.stub().returns({ pvp: 'stats' });
    mockGw2Api.readPvpGames = sinon.stub().returns({ pvp: 'games' });

    return setupTestDb({
      seed: true,
      email: 'email@email.com',
      alias: 'cool-name',
      addTokens: true,
    })
    .then((dbModels) => {
      models = dbModels;
      systemUnderTest = new PvpController(models, mockGw2Api);
    });
  });

  it('should return pvp data for primary token', () => {
    return systemUnderTest.stats('cool-name')
      .then((stats) => {
        expect(stats).to.eql({
          pvp: 'stats',
        });

        expect(mockGw2Api.readPvpStats).to.have.been.calledWith('cool_token');
      });
  });

  it('should return pvp games for primary token', () => {
    return systemUnderTest.games('cool-name')
      .then((games) => {
        expect(games).to.eql({
          pvp: 'games',
        });

        expect(mockGw2Api.readPvpGames).to.have.been.calledWith('cool_token');
      });
  });
});
