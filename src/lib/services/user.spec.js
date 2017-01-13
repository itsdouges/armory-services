import _ from 'lodash';
import * as testData from 'test/testData';

const readGuild = sinon.stub();
const readLatestPvpSeason = sinon.stub();

const service = proxyquire('lib/services/user', {
  './guild': {
    read: readGuild,
  },
  'lib/gw2': {
    readLatestPvpSeason,
  },
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
      expect(usr).to.eql({
        id: userTwo.id,
        alias: userTwo.alias,
        email: userTwo.email,
        passwordHash: userTwo.passwordHash,
        ...nullStandings ? {
          euRank: null,
          naRank: null,
          gw2aRank: null,
        } : _.pick(standing, [
          'euRank',
          'naRank',
          'gw2aRank',
        ]),
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

    beforeEach(() => {
      readLatestPvpSeason.returns(Promise.resolve({ id: standing.seasonId }));
    });

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

    context('with no standing info', () => {
      it('should return data', async () => {
        readLatestPvpSeason.returns(Promise.resolve({ id: '123-nah-lol' }));
        const usr = await service.read(models, { email: userTwo.email });

        assertUser(usr, true);
      });
    });
  });
});
