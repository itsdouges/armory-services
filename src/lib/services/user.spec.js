import _ from 'lodash';
import * as testData from 'test/testData';

const sandbox = sinon.sandbox.create();
const readGuild = sandbox.stub();
const readLatestPvpSeason = sandbox.stub();
const validateApiToken = sandbox.stub();
const readAccount = sandbox.stub();
const fetchToken = sandbox.spy();
const readTokenInfo = sandbox.stub();

const service = proxyquire('lib/services/user', {
  './guild': {
    read: readGuild,
  },
  'lib/gw2': {
    readLatestPvpSeason,
    readAccount,
    readTokenInfo,
  },
  'lib/services/tokens': {
    validate: validateApiToken,
  },
  'fetch/fetchers/account': fetchToken,
});

describe('user service', () => {
  let models;

  const permissions = ['guilds', 'account'];
  const guild = testData.guild();
  const user = testData.user();
  const apiToken = testData.apiToken();

  const userTwo = testData.user({
    id: '938C502D-F838-F447-8B43-4EBF34706E0445B2B503',
    alias: 'madouuu',
    email: 'email@email.email',
  });

  const apiTokenForUserTwo = testData.apiToken({
    id: 2,
    token: '123',
    UserId: userTwo.id,
    guilds: null,
    accountId: '1234',
    primary: true,
    accountName: 'hot4gw2.1234',
  });

  const standing = testData.dbStanding({
    apiTokenId: apiTokenForUserTwo.id,
  });

  beforeEach(async () => {
    models = await setupTestDb();

    await models.User.create(user);
    await models.User.create(userTwo);
    await models.Gw2ApiToken.create(apiToken);
    await models.Gw2ApiToken.create(apiTokenForUserTwo);
    await models.PvpStandings.create({
      ...standing,
      gw2aRank: 1,
    });

    readGuild.withArgs(models, { name: guild.name }).returns(Promise.resolve(guild));
    readLatestPvpSeason.returns(Promise.resolve({ id: standing.seasonId }));
  });

  afterEach(() => sandbox.reset());

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
        tokenId: apiTokenForUserTwo.id,
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

    context('with api token id', () => {
      it('should return data', async () => {
        const usr = await service.read(models, { apiTokenId: apiTokenForUserTwo.id });
        assertUser(usr);
      });

      context('when user doesnt exist', () => {
        it('should return null', async () => {
          const usr = await service.read(models, { apiTokenId: 1111 });
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
      const accountName = 'doobie.1234';
      const guilds = ['1234-1234', '4444-4444'];

      let stubUser;
      let stubUserId;

      beforeEach(async () => {
        const { id } = await service.createStubUser(models, { accountName, guilds });

        stubUserId = id;
        stubUser = await service.read(models, { accountName });
      });

      it('should add user to db', async () => {
        const stubUserValue = 'stubuser';

        expect(stubUser).to.include({
          access: null,
          accountName,
          alias: accountName,
          commander: null,
          dailyAp: null,
          email: stubUserValue,
          euRank: null,
          fractalLevel: null,
          guilds: guilds.join(','),
          gw2aRank: null,
          id: stubUserId,
          monthlyAp: null,
          naRank: null,
          passwordHash: stubUserValue,
          world: -1,
          wvwRank: null,
        });
      });

      it('should merge guilds if user already a stub user', async () => {
        const moreGuilds = [guilds[0], '12344444-4444'];

        await service.bulkCreateStubUser(models, [{
          accountName,
          guilds: moreGuilds,
          id: stubUserId,
        }]);

        const updatedStubUser = await service.read(models, { accountName });

        expect(updatedStubUser.guilds).to.eql([
          ...moreGuilds,
          guilds[1],
        ].join(','));
      });

      describe('bulk', () => {
        const userr = (name) => ({
          accountName: name,
          guilds: ['1234-4321'],
        });

        it('should add all users', async () => {
          const users = [userr('madou.13234'), userr('blastrn.4321')];

          await service.bulkCreateStubUser(models, users);

          const madou = await models.User.findOne({
            where: {
              alias: users[0].accountName,
            },
          });

          const blastrn = await models.User.findOne({
            where: {
              alias: users[1].accountName,
            },
          });

          expect(madou).to.exist;
          expect(blastrn).to.exist;
        });
      });
    });

    describe('claiming stub user', () => {
      const accountId = '4444-333-1111';

      context('when being claimed by a new user', () => {
        const accountName = 'sickUser.1234';
        const newUser = {
          email: 'email@email',
          alias: 'Sick User',
          passwordHash: 'ASDASD123122@#@#Q@#',
          apiToken: '1234-1234-1234',
        };

        beforeEach(async () => {
          const { apiTokenId } = await service.createStubUser(models, { accountName });
          await models.PvpStandings.create({
            apiTokenId,
            seasonId: 'a',
          });
          readTokenInfo.withArgs(newUser.apiToken).returns(Promise.resolve({
            permissions,
            id: accountId,
          }));
          readAccount.withArgs(newUser.apiToken).returns({ name: accountName });
          await service.claimStubUser(models, newUser);
        });

        it('should update user', async () => {
          const data = await service.read(models, { alias: newUser.alias });

          expect(data).to.contain({
            ..._.omit(newUser, ['apiToken']),
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
            permissions: permissions.join(','),
          });

          expect(fetchToken).to.have.been.calledWith(models, {
            token: newUser.apiToken,
            permissions: permissions.join(','),
            id: token.id,
          });
        });
      });

      context('when being claimed by an existing user', () => {
        const accountName = 'anotherSickUser.1234';
        const apiTokenClaimer = '4444-1111-4444';
        let response;

        beforeEach(async () => {
          readAccount.withArgs(apiTokenClaimer).returns({ name: accountName });
          readTokenInfo.withArgs(apiTokenClaimer).returns(Promise.resolve({
            permissions,
            id: accountId,
          }));
          await service.createStubUser(models, { accountName });
          response = await service.claimStubApiToken(models, user.email, apiTokenClaimer, true);
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
            permissions: permissions.join(','),
          });
        });

        it('should return response', () => {
          expect(response).to.include({
            accountName,
            permissions: permissions.join(','),
            token: apiTokenClaimer,
            primary: true,
          });

          expect(response.id).to.exist;
        });

        it('should delete stub user', async () => {
          const data = await service.read(models, { alias: accountName });

          expect(data).to.not.exist;
        });
      });
    });
  });
});
