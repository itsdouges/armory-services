const userResourceFactory = require('./index');
const Models = require('../../models');
const q = require('q');
const testDb = require('../../../spec/helpers/db');

describe('user resource', () => {
  let systemUnderTest;
  let models;
  let mockValidator;

  const mocks = {
    validate () {},
    gw2Api: {
      readAccount () {},
    },
  };

  function initialiseUserData () {
    spyOn(mocks, 'validate').and.returnValue(Promise.resolve());

    const user = {
      email: 'cool@email.com',
      password: 'password',
      alias: 'madou',
    };

    return systemUnderTest.create(user)
      .then((result) => {
        const token = {
          token: 'i-am-token',
          accountName: 'coolaccount.1234',
          permissions: 'abc,def',
          world: 'aus',
          accountId: 'i-am-id',
          UserId: result.id,
        };

        return models.Gw2ApiToken.create(token);
      })
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
      });
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
      systemUnderTest = userResourceFactory(models, mockValidator);
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
});
