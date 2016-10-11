const token = require('./index');
const Models = require('../../../models');

describe('gw2 token validator', () => {
  let mockAxios;
  let mockEnv;
  let models;

  beforeEach(() => {
    mockAxios = {
      get () {},
    };

    mockEnv = {
      gw2: {
        endpoint: 'gw2.com/',
      },
    };

    models = new Models(testDb());
    return models.sequelize.sync();
  });

  it('should resolve if item isnt found in object', () => {
    return token('token', undefined);
  });

  it('should resolve if token is valid', () => {
    sinon.stub(mockAxios, 'get').returns(Promise.resolve({
      data: {
        permissions: [
          'account',
          'characters',
          'builds',
        ],
      },
    }));

    return token('token', 'ee', {
      axios: mockAxios,
      env: mockEnv,
      models,
    })
    .then((e) => {
      expect(e).not.to.exist;
      expect(mockAxios.get).to.have.been.calledWith('gw2.com/v2/tokeninfo', {
        headers: {
          Authorization: 'Bearer ee',
        },
      });
    });
  });

  it('should resolve error if token doesnt have characters permission', () => {
    sinon.stub(mockAxios, 'get').returns(Promise.resolve({
      data: {
        permissions: [
          'account',
        ],
      },
    }));

    return token('token', 'ee', {
      axios: mockAxios,
      env: mockEnv,
      models,
    })
    .then((e) => {
      expect(e).to.eql({
        property: 'token',
        message: 'needs characters and builds permission',
      });
    });
  });

  it('should resolve error if token is already taken', () => {
    return models.User
      .create({
        email: 'email@email',
        passwordHash: 'lolz',
        alias: 'swagn',
      })
      .then((e) => {
        models.Gw2ApiToken
          .create({
            token: 'ee',
            accountName: 'madou.1234',
            permissions: 'he,he',
            accountId: 'ahh',
            world: 1122,
            UserId: e.id,
          })
          .then(() => {
            return token('token', 'ee', {
              axios: mockAxios,
              env: mockEnv,
              models,
            })
            .then((error) => {
              expect(error).to.eql({
                property: 'token',
                message: 'is already being used',
              });
            });
          });
      });
  });

  it('should resolve error if account id is already in db', () => {
    const mockGet = sinon.stub();

    mockGet.withArgs(`${mockEnv.gw2.endpoint}v2/tokeninfo`, sinon.match.object)
      .returns(Promise.resolve({
        data: {
          permissions: [
            'account',
            'characters',
            'builds',
          ],
        },
      }));

    mockGet.withArgs(`${mockEnv.gw2.endpoint}v2/account`, sinon.match.object)
      .returns(Promise.resolve({
        data: {
          id: 'ahh',
          name: 'madou.1234',
          world: 4455,
        },
      }));

    return models.User
      .create({
        email: 'email@email',
        passwordHash: 'lolz',
        alias: 'swagn',
      })
      .then((e) => {
        return models.Gw2ApiToken
          .create({
            token: 'hahahaha_token',
            accountName: 'madou.1234',
            permissions: 'he,he',
            accountId: 'ahh',
            world: 3344,
            UserId: e.id,
          })
          .then(() => {
            return token('token', 'another_token_i_generated', {
              axios: { get: mockGet },
              env: mockEnv,
              models,
            })
            .then((err) => {
              console.log(err);
              expect(err).to.eql({
                property: 'token',
                message: 'key for madou.1234 already exists',
              });
            });
          });
      });
  });

  it('should resolve error if an error occurred during http', () => {
    sinon.stub(mockAxios, 'get').returns(Promise.reject());

    return token('token', 'ee', {
      axios: mockAxios,
      env: mockEnv,
      models,
    })
    .then((e) => {
      expect(e).to.eql({
        property: 'token',
        message: 'invalid token',
      });
    });
  });
});
