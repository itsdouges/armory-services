import _ from 'lodash';
import * as testData from 'test/testData/db';

const sandbox = sinon.sandbox.create();
const readGuild = sandbox.stub();
const readLatestPvpSeason = sandbox.stub();
const validateApiToken = sandbox.stub();
const readAccount = sandbox.stub();
const readTokenInfo = sandbox.stub();
const httpPost = sandbox.spy();

const config = {
  fetch: {
    host: '10.123.123',
    port: '9888',
    concurrentCalls: 1,
  },
  forgotMyPassword: {
    expiry: 123,
  },
};

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
  axios: {
    post: httpPost,
  },
  config,
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

  const standing = testData.standing({
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

        expect(inGuild).to.equal(true);
      });
    });

    context('when user is not in guild', () => {
      it('should return false', async () => {
        const inGuild = await service.isUserInGuild(models, userTwo.email, guild.name);

        expect(inGuild).to.equal(false);
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
        wins: null,
        losses: null,
      } : _.pick(standing, [
        'euRank',
        'naRank',
        'gw2aRank',
        'ratingCurrent',
        'wins',
        'losses',
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

  describe('stub users', () => {
    describe('adding', () => {
      const newUser = (name) => ({
        accountName: name,
        guilds: ['1234-1234', '4444-4444'],
      });

      const users = [newUser('doobie.1234'), newUser('madou.13234'), newUser('blastrn.4321')];

      beforeEach(async () => {
        await service.bulkCreateStubUser(models, users);
      });

      it('should add users to db', async () => {
        const dataSet = await Promise.all(
          users.map(({ accountName }) => service.read(models, { accountName }))
        );
        const stubUserValue = 'stubuser';

        _.zip(dataSet, users).forEach(([actual, expected]) => {
          expect(actual).to.include({
            access: null,
            accountName: expected.accountName,
            alias: expected.accountName,
            commander: null,
            dailyAp: null,
            email: `${expected.accountName}@stub.com`,
            euRank: null,
            fractalLevel: null,
            guilds: users[0].guilds.join(','),
            gw2aRank: null,
            monthlyAp: null,
            naRank: null,
            passwordHash: stubUserValue,
            world: -1,
            wvwRank: null,
          });
        });
      });

      it('should merge guilds if user already a stub user', async () => {
        const moreGuilds = [users[0].guilds[0], '12344444-4444'];

        await service.bulkCreateStubUser(models, [{
          accountName: users[0].accountName,
          guilds: moreGuilds,
        }]);

        const updatedStubUser = await service.read(models, { accountName: users[0].accountName });

        expect(updatedStubUser.guilds).to.eql([
          ...moreGuilds,
          users[0].guilds[1],
        ].join(','));
      });

      it('should do nothing if guilds is not defined', async () => {
        const [e] = await service.bulkCreateStubUser(models, [{
          accountName: users[0].accountName,
        }]);

        expect(e.state).to.equal('fulfilled');

        const updatedStubUser = await service.read(models, { accountName: users[0].accountName });

        expect(updatedStubUser.guilds).to.eql(users[0].guilds.join(','));
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
          await service.bulkCreateStubUser(models, [{ accountName }]);

          const token = await models.Gw2ApiToken.findOne({
            where: {
              accountName,
            },
          });

          await models.PvpStandings.create({
            apiTokenId: token.id,
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

          expect(httpPost).to.have.been.calledWith(`http://${config.fetch.host}:${config.fetch.port}/fetch`, {
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
          await service.bulkCreateStubUser(models, [{ accountName }]);
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
