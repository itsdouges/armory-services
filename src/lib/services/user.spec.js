import * as testData from 'test/testData';

const readGuild = sinon.stub();

const service = proxyquire('lib/services/user', {
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

  before(async () => {
    models = await setupTestDb();

    await models.User.create(user);
    await models.Gw2ApiToken.create(apiToken);

    await models.User.create(userTwo);
    await models.Gw2ApiToken.create(apiTokenForUserTwo);

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

  it('should get user id by email', async () => {
    const id = await service.getUserIdByEmail(models, user.email);
    expect(id).to.exist;
  });

  it('should reject if user doesnt exist by email', async () => {
    try {
      await service.getUserIdByEmail(models, 'dont_exist');
    } catch (e) {
      expect(e).to.equal('User not found');
    }
  });

  it('should get user id by alias', async () => {
    const id = await service.getUserIdByAlias(models, user.alias);
    expect(id).to.exist;
  });

  it('should return user primary token', async () => {
    const token = await service.getUserPrimaryToken(models, userTwo.alias);
    expect(token).to.equal(apiTokenForUserTwo.token);
  });

  it('should return error if no primary token found', async () => {
    try {
      await service.getUserPrimaryToken(models, user.alias);
    } catch (e) {
      expect(e).to.equal('Token not found');
    }
  });
});
