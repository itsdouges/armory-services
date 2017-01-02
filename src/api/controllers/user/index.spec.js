const Models = require('lib/models');
const proxyquire = require('proxyquire');

describe('user resource', () => {
  let systemUnderTest;
  let models;
  let mockValidator;
  let mocks;
  let readGuild;

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
          guilds: 'cool,guilds',
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
    readGuild = sinon.stub().returns(Promise.resolve());

    const userResourceFactory = proxyquire('./index', {
      'lib/email': {
        send: mocks.sendEmail,
      },
      config,
      'lib/services/guild': {
        read: readGuild,
      },
    });

    return userResourceFactory(models, mockValidator);
  }

  beforeEach(async () => {
    mocks = {
      validate () {},
      sendEmail () {},
      gw2Api: {
        readAccount () {},
      },
    };

    mockValidator = function () {
      return {
        validate: mocks.validate,
      };
    };

    mockValidator.addResource = sinon.stub().returns(mockValidator);
    mockValidator.addRule = sinon.stub().returns(mockValidator);

    models = await setupTestDb();

    sinon.stub(mocks, 'sendEmail').returns(Promise.resolve('sent!'));

    systemUnderTest = createUserResource();
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
    const user = {
      email: 'cool@email.com',
      password: 'password',
      alias: 'madou',
    };

    it('should return user data', () => {
      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      return systemUnderTest
        .create(user)
        .then((data) => {
          expect(data.email).to.equal(user.email);
          expect(data.id).to.exist;
          expect(data.passwordHash).to.exist;
          expect(data.alias).to.equal(user.alias);
        });
    });

    it('should not explode if user doesnt have a primary token', () => {
      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      return systemUnderTest
        .create(user)
        .then(() => systemUnderTest.readPublic(user.alias));
    });

    it('should return public user data and ignore nulls', () => {
      const cool = {
        id: 'cool',
        tag: 'yeah',
        name: 'pretty nice',
        misc: 'ignore this',
      };

      readGuild.withArgs(models, { id: 'cool' }).returns(Promise.resolve(cool));
      readGuild.withArgs(models, { id: 'guilds' }).returns(Promise.resolve(null));

      return initialiseUserData()
        .then(() => systemUnderTest.readPublic('madou'))
        .then((data) => {
          expect(data).to.include({
            alias: 'madou',
            accountName: 'coolaccount.1234',
            world: 'aus',
            created: null,
            access: null,
            commander: null,
            fractalLevel: null,
            dailyAp: null,
            monthlyAp: null,
            wvwRank: null,
          });

          const { misc, ...expectedGuild } = cool;

          expect(data.guilds).to.eql([expectedGuild]);

          expect(data.characters).to.eql([{
            accountName: 'coolaccount.1234',
            world: 'aus',
            name: 'madoubie',
            gender: 'male',
            profession: 'elementalist',
            level: 69,
            race: 'yolon',
          }]);
        });
    });
  });

  describe('updating', () => {
    it('should reject promise if passwords don\'t matach', () => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      return systemUnderTest
        .create(user)
        .then(() => {
          user.currentPassword = 'WRONGPASS';
          return systemUnderTest.updatePassword(user);
        })
        .then(null, (e) => {
          expect(e).to.equal('Bad password');
        });
    });

    it('should resolve promise if passwords matach and commit to db', () => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      return systemUnderTest
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
        });
    });

    it('should reject if validation fails', () => {
      const error = 'errorrrr';
      sinon.stub(mocks, 'validate').returns(Promise.reject(error));

      return systemUnderTest
        .updatePassword({})
        .then(null, (e) => {
          expect(e).to.equal(error);
        });
    });
  });

  describe('creation', () => {
    it('should call validator and reject promise if validator returns errors', () => {
      const user = {};
      const errors = ['im a error'];

      sinon.stub(mocks, 'validate').returns(Promise.reject(errors));

      return systemUnderTest
          .create(user)
          .then(null, (e) => {
            expect(e).to.equal(errors);
          });
    });

    it('should add user to database with expected values', () => {
      const user = {
        email: 'cool@email.com',
        password: 'password',
        alias: 'madou',
      };

      sinon.stub(mocks, 'validate').returns(Promise.resolve());

      return systemUnderTest
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
            });
        });
    });
  });

  describe('forgot my password', () => {
    describe('when initiating', () => {
      it('should create a new record in the user resets table', () => {
        return initialiseUserData()
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
          });
      });

      it('should send an email', () => {
        return initialiseUserData()
          .then((user) => systemUnderTest.forgotMyPasswordStart(user.email)
            .then(() => models.UserReset.findAll({
              where: {
                UserId: user.id,
              },
            }))
            .then(() => expect(mocks.sendEmail).to.have.been.calledWith({
              subject: 'Forgot My Password',
              to: user.email,
              html: sinon.match.string,
            }))
          );
      });
    });

    describe('when finishing', () => {
      it('should reject if reset doesnt exist', () => {
        return systemUnderTest.forgotMyPasswordFinish('dontexist', 'hahpassword')
          .then(null, (err) => expect(err).to.eql('Reset doesn\'t exist.'));
      });

      it('should validate password', () => {
        const shittyPassword = 'bad';

        return init()
          .then((data) => systemUnderTest.forgotMyPasswordFinish(data.resetId, shittyPassword))
          .then(() => expect(mocks.validate).to.have.been.calledWith({ password: shittyPassword }));
      });

      it('should change password', () => {
        const newPassword = 'bad';

        return init()
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
          );
      });

      it('should not be allowed to be used if expiry time has passed', () => {
        const instance = createUserResource({
          PASSWORD_RESET_TIME_LIMIT: -5,
        });

        return init(instance)
          .then((data) => instance.forgotMyPasswordFinish(data.resetId, 'bad'))
          .then(null, (e) => expect(e).to.equal('Reset has expired.'));
      });

      it('should only allow reset to be used once', () => {
        return init()
          .then((data) =>
            systemUnderTest.forgotMyPasswordFinish(data.resetId, 'bad')
            .then(() => systemUnderTest.forgotMyPasswordFinish(data.resetId, 'bad'))
            .then(null, (e) => expect(e).to.equal('Reset has expired.'))
          );
      });
    });
  });
});
