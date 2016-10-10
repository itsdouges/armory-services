const Models = require('../../models');
const proxyquire = require('proxyquire');

describe('user resource', () => {
  let systemUnderTest;
  let models;
  let mockValidator;

  const mocks = {
    validate () {},
    sendEmail () {},
    gw2Api: {
      readAccount () {},
    },
  };

  const stubConfig = {
    PASSWORD_RESET_TIME_LIMIT: 5,
  };

  function initialiseUserData () {
    sinon.stub(mocks, 'validate').returns(Promise.resolve());

    const user = {
      email: 'cool@email.com',
      password: 'password',
      alias: 'madou',
    };

    return systemUnderTest.create(user)
      .then((userRow) => {
        const token = {
          token: 'i-am-token',
          accountName: 'coolaccount.1234',
          permissions: 'abc,def',
          world: 'aus',
          accountId: 'i-am-id',
          UserId: userRow.id,
          primary: true,
        };

        return models.Gw2ApiToken.create(token)
        .then((result) => {
          const character = {
            name: 'madoubie',
            race: 'yolon',
            gender: 'male',
            profession: 'elementalist',
            level: '69',
            created: 'Sat Oct 24 2015 19:30:34',
            age: 1234,
            guild: 'a-guild',
            deaths: 0,
            Gw2ApiTokenToken: result.token,
          };

          return models.Gw2Character.create(character);
        })
        .then(() => userRow);
      });
  }

  function init (instance = systemUnderTest) {
    return initialiseUserData()
      .then((user) => instance.forgotMyPasswordStart(user.email)
        .then(() => models.UserReset.findAll({
          where: {
            UserId: user.id,
          },
        }))
        .then(([reset]) => ({
          email: user.email,
          id: user.id,
          passwordHash: user.passwordHash,
          UserId: reset.UserId,
          resetId: reset.id,
          expires: reset.expires,
        }))
      );
  }

  function createUserResource (config = stubConfig) {
    const userResourceFactory = proxyquire('./index', {
      '../../lib/email': {
        send: mocks.sendEmail,
      },
      '../../../config': config,
    });

    return userResourceFactory(models, mockValidator);
  }

  beforeEach((done) => {
    mockValidator = function () {
      return {
        validate: mocks.validate,
      };
    };

    mockValidator.addResource = function () { };
    mockValidator.addRule = function () { };

    models = new Models(testDb());
    models.sequelize.sync({
      force: true,
    })
    .then(() => {
      sinon.stub(mocks, 'sendEmail').returns(Promise.resolve('sent!'));

      systemUnderTest = createUserResource();

      done();
    });

    sinon.stub(mockValidator, 'addResource').returns(mockValidator);
    sinon.stub(mockValidator, 'addRule').returns(mockValidator);
  });

  describe('initialisation', () => {
    it('should add users resource in create mode to validator', () => {
      expect(mockValidator.addResource).to.have.been.calledWith({
        name: 'users',
        mode: 'create',
        rules: {
          alias: ['required', 'unique-alias', 'no-white-space', 'min5'],
          email: ['required', 'unique-email', 'no-white-space'],
          password: ['required', 'ezpassword', 'no-white-space'],
        },
      });
    });

    it('should add users resource in update mode to validator', () => {
      expect(mockValidator.addResource).to.have.been.calledWith({
        name: 'users',
        mode: 'update-password',
        rules: {
          email: 'required',
          currentPassword: ['required'],
          password: ['required', 'ezpassword', 'no-white-space'],
        },
      });
    });
  });

  describe('read', () => {
    it('should return user data', (done) => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      systemUnderTest
        .create(user)
        .then((data) => {
          expect(data.email).to.equal(user.email);
          expect(data.id).to.exist;
          expect(data.passwordHash).to.exist;
          expect(data.alias).to.equal(user.alias);

          done();
        });
    });

    it('should return public user data', (done) => {
      initialiseUserData()
        .then(() => systemUnderTest.readPublic('madou'))
        .then((data) => {
          expect(data.alias).to.equal('madou');
          expect(data.accountName).to.equal('coolaccount.1234');
          expect(data.createdAt).to.exist;
          expect(data.characters).to.eql([{
            accountName: 'coolaccount.1234',
            world: 'aus',
            name: 'madoubie',
            gender: 'male',
            profession: 'elementalist',
            level: 69,
            race: 'yolon',
          }]);

          done();
        }, (e) => console.error(e));
    });
  });

  describe('updating', () => {
    it('should reject promise if passwords don\'t matach', (done) => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      systemUnderTest
        .create(user)
        .then(() => {
          user.currentPassword = 'WRONGPASS';
          return systemUnderTest.updatePassword(user);
        })
        .then(null, (e) => {
          expect(e).to.equal('Bad password');

          done();
        });
    });

    it('should resolve promise if passwords matach and commit to db', (done) => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      systemUnderTest
        .create(user)
        .then(() => {
          user.currentPassword = user.password;
          user.password = 'NewPass123';
          user.oldHash = user.passwordHash;

          return systemUnderTest.updatePassword(user);
        })
        .then(() => systemUnderTest.read(user.email))
        .then((e) => {
          expect(e.passwordHash).not.to.equal(user.oldHash);
          expect(e.passwordHash).to.exist;

          done();
        });
    });

    it('should reject if validation fails', (done) => {
      const error = 'errorrrr';
      sinon.stub(mocks, 'validate').returns(Promise.reject(error));

      systemUnderTest
        .updatePassword({})
        .then(null, (e) => {
          expect(e).to.equal(error);
          done();
        });
    });
  });

  describe('creation', () => {
    it('should call validator and reject promise if validator returns errors', (done) => {
      const user = {};
      const errors = ['im a error'];

      sinon.stub(mocks, 'validate').returns(Promise.reject(errors));

      systemUnderTest
          .create(user)
          .then(null, (e) => {
            expect(e).to.equal(errors);

            done();
          });
    });

    it('should add user to database with expected values', (done) => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      systemUnderTest
        .create(user)
        .then(() => {
          models.User
            .findOne({
              where: {
                email: user.email,
              },
              include: [{
                all: true,
              }],
            })
            .then((e) => {
              expect(e.id).to.exist;
              expect(e.email).to.equal(user.email);
              expect(e.alias).to.equal(user.alias);
              expect(e.passwordHash).to.exist;
              expect(e.emailValidated).to.equal(false);

              done();
            });
        });
    });
  });

  describe('forgot my password', () => {
    describe('when initiating', () => {
      it('should create a new record in the user resets table', (done) => {
        initialiseUserData()
          .then((user) => systemUnderTest.forgotMyPasswordStart(user.email)
            .then(() => models.UserReset.findAll({
              where: {
                UserId: user.id,
              },
            }))
          )
          .then((results) => {
            expect(results.length).to.equal(1);
            const row = results[0];
            expect(row.expires).to.exist;
            expect(row.UserId).to.exist;
            expect(row.used).to.exist;
            expect(row.id).to.exist;
          })
          .then(done);
      });

      it('should send an email', (done) => {
        initialiseUserData()
          .then((user) => systemUnderTest.forgotMyPasswordStart(user.email)
            .then(() => models.UserReset.findAll({
              where: {
                UserId: user.id,
              },
            }))
            .then(() => expect(mocks.sendEmail).to.have.been.calledWith({
              subject: 'Forgot My Password',
              to: user.email,
              html: jasmine.any(String),
            }))
          )
          .then(done);
      });
    });

    describe('when finishing', () => {
      it('should reject if reset doesnt exist', (done) => {
        systemUnderTest.forgotMyPasswordFinish('dontexist', 'hahpassword')
          .then(null, (err) => expect(err).to.eql('Reset doesn\'t exist.'))
          .then(done);
      });

      it('should validate password', (done) => {
        const shittyPassword = 'bad';

        init()
          .then((data) => systemUnderTest.forgotMyPasswordFinish(data.resetId, shittyPassword))
          .then(() => expect(mocks.validate).to.have.been.calledWith({ password: shittyPassword }))
          .then(done);
      });

      it('should change password', (done) => {
        const newPassword = 'bad';

        init()
          .then((data) =>
            systemUnderTest.forgotMyPasswordFinish(data.resetId, newPassword)
              .then(() =>
                models.User.findOne({
                  where: {
                    id: data.id,
                  },
                })
              )
              .then((user) =>
                expect(user.passwordHash).to.exist ||
                expect(user.passwordHash).not.to.eql(data.passwordHash)
              )
          )
          .then(done);
      });

      it('should not be allowed to be used if expiry time has passed', (done) => {
        const instance = createUserResource({
          PASSWORD_RESET_TIME_LIMIT: -5,
        });

        init(instance)
          .then((data) => instance.forgotMyPasswordFinish(data.resetId, 'bad'))
          .then(null, (e) => expect(e).to.equal('Reset has expired.'))
          .then(done);
      });

      it('should only allow reset to be used once', (done) => {
        init()
          .then((data) =>
            systemUnderTest.forgotMyPasswordFinish(data.resetId, 'bad')
            .then(() => systemUnderTest.forgotMyPasswordFinish(data.resetId, 'bad'))
            .then(null, (e) => expect(e).to.equal('Reset has expired.') || done())
          );
      });
    });
  });
});
