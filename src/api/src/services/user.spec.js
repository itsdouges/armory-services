import proxyquire from 'proxyquire';
import * as testData from '../../test/testData';

const readGuild = sinon.stub();

const service = proxyquire('./user', {
  './guild': {
    read: readGuild,
  },
});

describe('user service', () => {
  let models;

  const guild = testData.guild();
  const user = testData.user();
  const apiToken = testData.apiToken();

  const userTwo = testData.user({
    id: '938C502D-F838-F447-8B43-4EBF34706E0445B2B503',
    alias: 'madou',
    email: 'email@email.email',
  });

  before(async () => {
    models = await setupTestDb();

    await models.User.create(user);
    await models.Gw2ApiToken.create(apiToken);

    await models.User.create(userTwo);
    await models.Gw2ApiToken.create(testData.apiToken({
      guilds: null,
      token: '123',
      UserId: userTwo.id,
      accountId: '1234',
    }));

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
});
