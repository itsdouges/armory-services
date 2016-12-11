import { list, isUserInGuild } from './user';
import * as testData from '../../test/testData';

describe.only('user service', () => {
  const guild = 'im-guild';
  let models;

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
  });

  describe('list', () => {
    it('should return all users in guild', () => {
      return list(models, { guild }).should.eventually.become([{
        accountName: apiToken.accountName,
        name: user.alias,
      }]);
    });
  });

  describe('is user in guild', () => {
    context('when user is in guild', () => {
      it('should return true', () => {
        return isUserInGuild(models, user.email, apiToken.guilds).should.eventually.become(true);
      });
    });

    context('when user is not in guild', () => {
      it('should return false', () => {
        return isUserInGuild(models, userTwo.email, apiToken.guilds)
          .should.eventually.become(false);
      });
    });
  });
});
