var getUserInfo = require('./get-user-info');

describe('get user info', function () {
  var models;

  function setup (withTokens) {
    return seedData(true, {
      email: 'email@email.com',
      alias: 'cool-name',
      addTokens: !!withTokens,
    })
    .then(function (dbModels) {
      models = dbModels;
    });
  }

  it('should get user id by email', function (done) {
    setup().then(function () {
      return getUserInfo.getUserIdByEmail(models, 'email@email.com');
    })
    .then(function (id) {
      expect(id).to.exist;
      done();
    });
  });

  it('should reject if user doesnt exist by email', function (done) {
    setup().then(function () {
      return getUserInfo.getUserIdByEmail(models, 'dont_exist');
    })
    .then(null, function (error) {
      expect(error).to.equal('User not found');
      done();
    });
  });

  it('should get user id by alias', function (done) {
    setup().then(function () {
      return getUserInfo.getUserIdByAlias(models, 'cool-name');
    })
    .then(function (id) {
      expect(id).to.exist;
      done();
    });
  });

  it('should return user primary token', function (done) {
    setup(true).then(function () {
      return getUserInfo.getUserPrimaryToken(models, 'cool-name');
    })
    .then(function (token) {
      expect(token).to.equal('cool_token');
      done();
    });
  });

  it('should return error if no primary token found', function (done) {
    setup(false).then(function () {
      return getUserInfo.getUserIdByEmail(models, 'email@email.com');
    })
    .then(function () {
      return getUserInfo.getUserPrimaryToken(models, 'cool-name');
    })
    .then(null, function (token) {
      expect(token).to.equal('Token not found');
      done();
    });
  });
});
