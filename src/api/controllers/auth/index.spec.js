const password = require('password-hash-and-salt');
const controller = require('./index');
const Models = require('lib/models');

describe('auth controller', () => {
  let sut;
  let models;

  beforeEach(async () => {
    models = await setupTestDb();

    sut = controller(models, {
      jwtTokens: {
        secret: 'secret',
      },
    });
  });

  const createInitialUser = function () {
    return new Promise((resolve) => {
      password('coolpassword').hash((err, hash) => {
        models
          .User
          .create({
            email: 'cool@email',
            passwordHash: hash,
            alias: 'madou',
          })
          .then(() => {
            resolve();
          });
      });
    });
  };

  it('should cb with token and add it to db', (done) => {
    createInitialUser()
      .then(() => {
        sut.grantUserToken({
          username: 'cool@email',
          password: 'coolpassword',
        }, null, (err, res) => {
          expect(res).to.be.truthy;

          models
            .UserToken
            .findOne({
              where: {
                token: res,
              },
            })
            .then((item) => {
              expect(item.token).to.equal(res);
              expect(item.email).to.equal('cool@email');

              done();
            });
        });
      });
  });

  it('should cb with false if wrong password sent in for existing user', (done) => {
    createInitialUser()
      .then(() => {
        sut.grantUserToken({
          username: 'cool@email',
          password: 'badpass',
        }, null, (err, res) => {
          expect(res).to.equal(false);

          done();
        });
      });
  });

  it('should cb with false', (done) => {
    sut.grantUserToken({
      username: 'cool@email',
      password: 'coolpassword',
    }, null, (err, res) => {
      expect(res).to.equal(false);

      done();
    });
  });

  it('should authenticate token', (done) => {
    const req = {};

    createInitialUser()
      .then(() => {
        sut.grantUserToken({
          username: 'cool@email',
          password: 'coolpassword',
        }, null, (err, token) => {
          sut.authenticateToken(token, req, (errr, validated) => {
            expect(validated).to.equal(true);
            expect(req.username).to.equal('cool@email');

            done();
          });
        });
      });
  });

  describe('client validation', () => {
    it('should cb true', (done) => {
      sut.validateClient(null, null, (err, res) => {
        expect(res).to.equal(true);

        done();
      });
    });
  });
});
