const proxyquire = require('proxyquire');
const Models = require('../../models');

describe('gw2 token controller', () => {
  let systemUnderTest;
  let mockValidator;
  let mockGw2Api;
  let models;

  let mocks;

  const mockConfig = {
    ping: {
      host: 'host',
      port: 'port',
    },
  };

  let mockAxios;

  beforeEach((done) => {
    models = new Models(testDb());
    models.sequelize.sync({
      force: true,
    }).then(() => {
      done();
    });

    mockGw2Api = {
      readTokenInfoWithAccount () {},
    };

    mocks = {
      validate () {},
    };

    mockValidator = function () {
      return {
        validate: mocks.validate,
      };
    };

    mockAxios = {
      post () {},
    };

    mockValidator.addResource = function () {};

    sinon.stub(mockValidator, 'addResource').returns(mockValidator);

    const Controller = proxyquire('./', {
      axios: mockAxios,
      '../../../config': mockConfig,
    });

    systemUnderTest = new Controller(models, mockValidator, mockGw2Api);
  });

  const seedDb = function (email, addTokens = true) {
    return models
      .User
      .create({
        email,
        passwordHash: 'lolz',
        alias: 'swagn',
      })
      .then((user) => {
        if (!addTokens) {
          return user.id;
        }

        return models
          .Gw2ApiToken
          .create({
            token: 'cool_token',
            accountName: 'madou.0',
            permissions: 'he,he',
            accountId: '12341234',
            world: 1234,
            UserId: user.id,
          })
          .then(() => {
            return models
              .Gw2ApiToken
              .create({
                token: 'another_token',
                accountName: 'madou.1',
                permissions: 'he,he',
                accountId: '4321431',
                world: 4321,
                UserId: user.id,
              });
          })
          .then(() => {
            return user.id;
          });
      });
  };

  describe('list', () => {
    it('should list tokens in db', (done) => {
      seedDb('email@email.com')
        .then(() => {
          systemUnderTest
            .list('email@email.com')
            .then((tokens) => {
              expect(2).to.equal(tokens.length);

              const [token1, token2] = tokens;

              expect('cool_token').to.equal(token1.token);
              expect('madou.0').to.equal(token1.accountName);
              expect(1234).to.equal(token1.world);
              expect(false).to.equal(token1.primary);

              expect('another_token').to.equal(token2.token);
              expect('madou.1').to.equal(token2.accountName);
              expect(4321).to.equal(token2.world);
              expect(false).to.equal(token2.primary);

              done();
            });
        });
    });
  });

  describe('adding', () => {
    it('should add users resource in update-gw2-token mode to validator', () => {
      expect(mockValidator.addResource).to.have.been.calledWith({
        name: 'gw2-token',
        mode: 'add',
        rules: {
          token: ['valid-gw2-token', 'no-white-space'],
        },
      });
    });

    it('should reject promise if validation fails', (done) => {
      sinon.stub(mocks, 'validate').returns(Promise.reject('failed'));

      systemUnderTest
        .add('1234', 'token')
        .then(null, (e) => {
          expect(mocks.validate).to.have.been.calledWith({
            token: 'token',
          });

          expect(e).to.equal('failed');

          done();
        });
    });

    it('should return true if user has tokens', (done) => {
      seedDb('email@email.com')
        .then((id) => {
          return systemUnderTest.doesUserHaveTokens(id);
        })
        .then((result) => {
          expect(result).to.equal(true);
          done();
        });
    });

    it('should return false if user has no tokens', (done) => {
      seedDb('email@stuff.com', false)
        .then((id) => {
          return systemUnderTest.doesUserHaveTokens(id);
        })
        .then((result) => {
          expect(result).to.equal(false);
          done();
        });
    });

    it('should add token to db as not primary', (done) => {
      sinon.stub(mocks, 'validate').returns(Promise.resolve());
      sinon.stub(mockGw2Api, 'readTokenInfoWithAccount').returns(Promise.resolve({
        accountName: 'nameee',
        accountId: 'eeee',
        world: 1122,
        info: ['cool', 'yeah!'],
      }));

      sinon.stub(mockAxios, 'post').returns(Promise.resolve());

      seedDb('cool@email.com')
        .then(() => {
          systemUnderTest
            .add('cool@email.com', 'token')
            .then((result) => {
              expect(result.primary).to.equal(false);
              done();
            });
        });
    });

    it('should add token to db as primary if first token', (done) => {
      sinon.stub(mocks, 'validate').returns(Promise.resolve());
      sinon.stub(mockGw2Api, 'readTokenInfoWithAccount').returns(Promise.resolve({
        accountName: 'nameee',
        accountId: 'eeee',
        world: 1122,
        info: ['cool', 'yeah!'],
      }));
      sinon.stub(mockAxios, 'post').returns(Promise.resolve());

      models
        .User
        .create({
          email: 'cool@email.com',
          passwordHash: 'lolz',
          alias: 'swagn',
        })
        .then(() => {
          systemUnderTest
            .add('cool@email.com', 'token')
            .then((result) => {
              expect(result.token).to.equal('token');
              expect(result.primary).to.equal(true);
              expect(result.permissions).to.equal('cool,yeah!');
              expect(result.accountName).to.equal('nameee');

              expect(mockAxios.post).to.have.been.calledWith('http://host:port/fetch-characters', {
                token: 'token',
              });

              done();
            });
        });
    });
  });

  describe('primary', () => {
    it('should set all tokens primary to false except for target', (done) => {
      seedDb('email@email.com')
        .then(() => {
          return systemUnderTest.selectPrimary('email@email.com', 'another_token');
        })
        .then((data) => {
          expect(data).to.eql([1]);
        })
        .then(() => {
          return models
            .Gw2ApiToken
            .findAll();
        })
        .then((data) => {
          data.forEach((token) => {
            if (token.token === 'another_token') {
              expect(token.primary).to.equal(true);
            } else {
              expect(token.primary).to.equal(false);
            }
          });

          done();
        });
    });
  });

  describe('removing', () => {
    // todo: omg this is so dirty clean it up later.. lol
    it('should remove token from db', (done) => {
      sinon.stub(mocks, 'validate').returns(Promise.resolve());
      sinon.stub(mockGw2Api, 'readTokenInfoWithAccount').returns(Promise.resolve({
        accountName: 'nameee',
        accountId: 'eeee',
        world: 1122,
        info: ['cool', 'yeah!'],
      }));
      sinon.stub(mockAxios, 'post').returns(Promise.resolve());

      models
        .User
        .create({
          email: 'cool@email.com',
          passwordHash: 'lolz',
          alias: 'swagn',
        })
        .then(() => {
          systemUnderTest
            .add('cool@email.com', 'token')
            .then((result) => {
              expect(result.token).to.equal('token');
              expect(result.accountName).to.equal('nameee');

              systemUnderTest
                .remove('cool@email.com', 'token')
                .then((rez) => {
                  expect(rez).to.equal(1);

                  models
                      .Gw2ApiToken
                      .findOne({
                        where: {
                          token: 'token',
                        },
                      }).then((res) => {
                        expect(res).to.equal(null);
                        done();
                      });
                });
            });
        });
    });
  });
});
