const Models = require('../../models');
const testDb = require('../../../spec/helpers/db');
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
    spyOn(mocks, 'validate').and.returnValue(Promise.resolve());

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
      '../../../env': config,
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
      spyOn(mocks, 'sendEmail').and.returnValue(Promise.resolve('sent!'));

      systemUnderTest = createUserResource();

      done();
    });

    spyOn(mockValidator, 'addResource').and.returnValue(mockValidator);
    spyOn(mockValidator, 'addRule').and.returnValue(mockValidator);
  });

  describe('initialisation', () => {
    it('should add users resource in create mode to validator', () => {
      expect(mockValidator.addResource).toHaveBeenCalledWith({
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
      expect(mockValidator.addResource).toHaveBeenCalledWith({
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

      spyOn(mocks, 'validate').and.returnValue(Promise.resolve());

      systemUnderTest
        .create(user)
        .then((data) => {
          expect(data.email).toBe(user.email);
          expect(data.id).toBeDefined();
          expect(data.passwordHash).toBeDefined();
          expect(data.alias).toBe(user.alias);

          done();
        });
    });

    it('should return public user data', (done) => {
      initialiseUserData()
        .then(() => systemUnderTest.readPublic('madou'))
        .then((data) => {
          expect(data.alias).toBe('madou');
          expect(data.createdAt).toBeDefined();
          expect(data.characters).toEqual([{
            accountName: 'coolaccount.1234',
            world: 'aus',
            name: 'madoubie',
            gender: 'male',
            profession: 'elementalist',
            level: 69,
            race: 'yolon',
          }]);

          done();
        });
    });
  });

  describe('updating', () => {
    it('should reject promise if passwords don\'t matach', (done) => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      spyOn(mocks, 'validate').and.returnValue(Promise.resolve());

      systemUnderTest
        .create(user)
        .then(() => {
          user.currentPassword = 'WRONGPASS';
          return systemUnderTest.updatePassword(user);
        })
        .then(null, (e) => {
          expect(e).toBe('Bad password');

          done();
        });
    });

    it('should resolve promise if passwords matach and commit to db', (done) => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      spyOn(mocks, 'validate').and.returnValue(Promise.resolve());

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
          expect(e.passwordHash).not.toBe(user.oldHash);
          expect(e.passwordHash).toBeDefined();

          done();
        });
    });

    it('should reject if validation fails', (done) => {
      const error = 'errorrrr';
      spyOn(mocks, 'validate').and.returnValue(Promise.reject(error));

      systemUnderTest
        .updatePassword({})
        .then(null, (e) => {
          expect(e).toBe(error);
          done();
        });
    });
  });

  describe('creation', () => {
    it('should call validator and reject promise if validator returns errors', (done) => {
      const user = {};
      const errors = ['im a error'];

      spyOn(mocks, 'validate').and.returnValue(Promise.reject(errors));

      systemUnderTest
          .create(user)
          .then(null, (e) => {
            expect(e).toBe(errors);

            done();
          });
    });

    it('should add user to database with expected values', (done) => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      spyOn(mocks, 'validate').and.returnValue(Promise.resolve());

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
              expect(e.id).toBeDefined();
              expect(e.email).toBe(user.email);
              expect(e.alias).toBe(user.alias);
              expect(e.passwordHash).toBeDefined();
              expect(e.emailValidated).toBe(false);

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
            expect(results.length).toBe(1);
            const row = results[0];
            expect(row.expires).toBeDefined();
            expect(row.UserId).toBeDefined();
            expect(row.used).toBeDefined();
            expect(row.id).toBeDefined();
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
            .then(() => expect(mocks.sendEmail).toHaveBeenCalledWith({
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
          .then(null, (err) => expect(err).toEqual('Reset doesn\'t exist.'))
          .then(done);
      });

      it('should validate password', (done) => {
        const shittyPassword = 'bad';

        init()
          .then((data) => systemUnderTest.forgotMyPasswordFinish(data.resetId, shittyPassword))
          .then(() => expect(mocks.validate).toHaveBeenCalledWith({ password: shittyPassword }))
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
                expect(user.passwordHash).toBeDefined() ||
                expect(user.passwordHash).not.toEqual(data.passwordHash)
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
          .then(null, (e) => expect(e).toBe('Reset has expired.'))
          .then(done);
      });

      it('should only allow reset to be used once', (done) => {
        init()
          .then((data) =>
            systemUnderTest.forgotMyPasswordFinish(data.resetId, 'bad')
            .then(() => systemUnderTest.forgotMyPasswordFinish(data.resetId, 'bad'))
            .then(null, (e) => expect(e).toBe('Reset has expired.') || done())
          );
      });
    });
  });
});
