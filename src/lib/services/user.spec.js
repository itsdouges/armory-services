import _ from 'lodash';
import * as testData from 'test/testData';

const sandbox = sinon.sandbox.create();
const readGuild = sandbox.stub();
const readLatestPvpSeason = sandbox.stub();
const validateApiToken = sandbox.stub();
const readAccount = sandbox.stub();
const fetchToken = sandbox.spy();

const service = proxyquire('lib/services/user', {
  './guild': {
    read: readGuild,
  },
  'lib/gw2': {
    readLatestPvpSeason,
    readAccount,
  },
  'lib/services/tokens': {
    validate: validateApiToken,
  },
  'fetch/fetchers/account': fetchToken,
});

describe('user service', () => {
  let models;

  const guild = testData.guild();
  const user = testData.user();
  const apiToken = testData.apiToken();

  const userTwo = testData.user({
    id: '938C502D-F838-F447-8B43-4EBF34706E0445B2B503',
    alias: 'madouuu',
    email: 'email@email.email',
  });

  const apiTokenForUserTwo = testData.apiToken({
    guilds: null,
    token: '123',
    UserId: userTwo.id,
    accountId: '1234',
    primary: true,
    accountName: 'hot4gw2.1234',
  });

  const standing = testData.dbStanding({
    apiToken: apiTokenForUserTwo.token,
  });

  before(async () => {
    models = await setupTestDb();

    await models.User.create(user);
    await models.Gw2ApiToken.create(apiToken);

    await models.User.create(userTwo);
    await models.Gw2ApiToken.create(apiTokenForUserTwo);
    await models.PvpStandings.create(standing);

    readGuild.withArgs(models, { name: guild.name }).returns(Promise.resolve(guild));
    readLatestPvpSeason.returns(Promise.resolve({ id: standing.seasonId }));
  });

  describe('list', () => {
    it('should return all users in guild', async () => {
      const list = await service.list(models, { guild: guild.id });

      expect(list).to.eql([{
        accountName: apiToken.accountName,
        name: user.alias,
      }]);
    });
  });

  describe('is user in guild', () => {
    context('when user is in guild', () => {
      it('should return true', async () => {
        const inGuild = await service.isUserInGuild(models, user.email, guild.name);

        expect(inGuild).to.be.true;
      });
    });

    context('when user is not in guild', () => {
      it('should return false', async () => {
        const inGuild = await service.isUserInGuild(models, userTwo.email, guild.name);

        expect(inGuild).to.be.false;
      });
    });
  });

  describe('read', () => {
    const assertUser = (usr, nullStandings) => {
      const { ratingCurrent, ...standingData } = nullStandings ? {
        euRank: null,
        naRank: null,
        gw2aRank: null,
        ratingCurrent: null,
      } : _.pick(standing, [
        'euRank',
        'naRank',
        'gw2aRank',
        'ratingCurrent',
      ]);

      expect(usr).to.eql({
        id: userTwo.id,
        alias: userTwo.alias,
        email: userTwo.email,
        passwordHash: userTwo.passwordHash,
        stub: false,
        rating: ratingCurrent,
        ...standingData,
        ..._.pick(apiTokenForUserTwo, [
          'token',
          'accountName',
          'world',
          'access',
          'commander',
          'fractalLevel',
          'dailyAp',
          'monthlyAp',
          'wvwRank',
          'guilds',
        ]),
      });
    };

    context('with api token', () => {
      it('should return data', async () => {
        const usr = await service.read(models, { apiToken: apiTokenForUserTwo.token });

        assertUser(usr);
      });

      context('when user doesnt exist', () => {
        it('should return null', async () => {
          const usr = await service.read(models, { apiToken: 'asd' });
          expect(usr).to.be.null;
        });
      });
    });

    context('with alias', () => {
      it('should return data', async () => {
        const usr = await service.read(models, { alias: userTwo.alias });

        assertUser(usr);
      });

      context('when user doesnt exist', () => {
        it('should return null', async () => {
          const usr = await service.read(models, { alias: 'asd' });
          expect(usr).to.be.null;
        });
      });
    });

    context('with email', () => {
      it('should return data', async () => {
        const usr = await service.read(models, { email: userTwo.email });

        assertUser(usr);
      });

      context('when user doesnt exist', () => {
        it('should return null', async () => {
          const usr = await service.read(models, { email: 'asd' });
          expect(usr).to.be.null;
        });
      });
    });

    context('with accountName', () => {
      it('should return data', async () => {
        const usr = await service.read(models, { accountName: apiTokenForUserTwo.accountName });

        assertUser(usr);
      });

      context('when user doesnt exist', () => {
        it('should return null', async () => {
          const usr = await service.read(models, { accountName: 'lol-yeah' });
          expect(usr).to.be.null;
        });
      });
    });

    context('with no standing info', () => {
      it('should return data', async () => {
        readLatestPvpSeason.returns(Promise.resolve({ id: '123-nah-lol' }));
        const usr = await service.read(models, { email: userTwo.email });

        assertUser(usr, true);
      });
    });
  });

  describe('stub user', () => {
    describe('adding', () => {
      it('should add user to db', async () => {
        const accountName = 'doobie.1234';
        const stubUserValue = 'stubuser';

        const id = await service.createStubUser(models, accountName);

        const stubUser = await service.read(models, { accountName });
        expect(stubUser).to.include({
          access: null,
          accountName,
          alias: accountName,
          commander: null,
          dailyAp: null,
          email: stubUserValue,
          euRank: null,
          fractalLevel: null,
          guilds: null,
          gw2aRank: null,
          id,
          monthlyAp: null,
          naRank: null,
          passwordHash: stubUserValue,
          world: -1,
          wvwRank: null,
        });
      });
    });

    describe('claiming stub user', () => {
      context('when being claimed by a new user', () => {
        const accountName = 'sickUser.1234';
        const newUser = {
          email: 'email@email',
          alias: 'Sick User',
          passwordHash: 'ASDASD123122@#@#Q@#',
          apiToken: '1234-1234-1234',
        };

        before(async () => {
          await service.createStubUser(models, accountName);

          readAccount.withArgs(newUser.apiToken).returns({ name: accountName });
          await service.claimStubUser(models, newUser);
        });

        it('should update user', async () => {
          const data = await service.read(models, { alias: newUser.alias });

          const { apiToken, ...userData } = newUser;

          expect(data).to.contain({
            ...userData,
            stub: false,
          });
        });

        it('should update apiToken', async () => {
          const token = await models.Gw2ApiToken.findOne({
            where: {
              accountName,
            },
          });

          expect(token).to.include({
            stub: false,
            token: newUser.apiToken,
          });

          expect(fetchToken).to.have.been.calledWith(models, { token: newUser.apiToken });
        });
      });

      context('when being claimed by an existing user', () => {
        const accountName = 'anotherSickUser.1234';
        const apiTokenClaimer = '4444-1111-4444';

        before(async () => {
          readAccount.withArgs(apiTokenClaimer).returns({ name: accountName });
          await service.createStubUser(models, accountName);
          await service.claimStubApiToken(models, user.email, apiTokenClaimer);
        });

        it('should update token', async () => {
          const token = await models.Gw2ApiToken.findOne({
            where: {
              accountName,
            },
          });

          expect(token).to.include({
            stub: false,
            token: apiTokenClaimer,
          });

          expect(fetchToken).to.have.been.calledWith(models, { token: apiTokenClaimer });
        });

        it('should delete stub user', async () => {
          const data = await service.read(models, { alias: accountName });

          expect(data).to.not.exist;
        });
      });
    });
  });
});
