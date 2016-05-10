var PvpController = require('./');
var setupTestDb = require('../../../spec/helpers/setup-test-db');

describe('pvp controller', function () {
  var models;
  var systemUnderTest;
  var mockGw2Api;

  beforeEach(function (done) {
    mockGw2Api = {};
    mockGw2Api.readPvpStats = function () {};
    mockGw2Api.readPvpGames = function () {};
    spyOn(mockGw2Api, 'readPvpStats').and.returnValue({ pvp: 'stats' });
    spyOn(mockGw2Api, 'readPvpGames').and.returnValue({ pvp: 'games' });

    return setupTestDb(true, {
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
        expect(stats).toEqual({
          pvp: 'stats',
        });

        expect(mockGw2Api.readPvpStats).toHaveBeenCalledWith('cool_token');

        done();
      });
  });

  it('should return pvp games for primary token', function (done) {
    return systemUnderTest.games('cool-name')
      .then(function (games) {
        expect(games).toEqual({
          pvp: 'games',
        });

        expect(mockGw2Api.readPvpGames).toHaveBeenCalledWith('cool_token');

        done();
      });
  });
});
