var PvpController = require('./');

describe('pvp controller', function () {
  var models;
  var systemUnderTest;
  var mockGw2Api;

  beforeEach(function (done) {
    mockGw2Api = {};
    mockGw2Api.readPvpStats = function () {};
    mockGw2Api.readPvpGames = function () {};
    sinon.stub(mockGw2Api, 'readPvpStats').returns({ pvp: 'stats' });
    sinon.stub(mockGw2Api, 'readPvpGames').returns({ pvp: 'games' });

    return seedData(true, {
      email: 'email@email.com',
      alias: 'cool-name',
      addTokens: true,
    })
    .then(function (dbModels) {
      models = dbModels;
      systemUnderTest = new PvpController(models, mockGw2Api);
      done();
    });
  });

  it('should return pvp data for primary token', function (done) {
    return systemUnderTest.stats('cool-name')
      .then(function (stats) {
        expect(stats).to.eql({
          pvp: 'stats',
        });

        expect(mockGw2Api.readPvpStats).to.have.been.calledWith('cool_token');

        done();
      });
  });

  it('should return pvp games for primary token', function (done) {
    return systemUnderTest.games('cool-name')
      .then(function (games) {
        expect(games).to.eql({
          pvp: 'games',
        });

        expect(mockGw2Api.readPvpGames).to.have.been.calledWith('cool_token');

        done();
      });
  });
});
