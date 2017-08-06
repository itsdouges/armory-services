import _ from 'lodash';
import * as testData from 'test/testData/db';

import { list, replace } from './tokens';

describe('token service', () => {
  let models;

  const apiToken = testData.apiToken();

  beforeEach(async () => {
    models = await setupTestDb();

    models.User.create(testData.user());
    models.Gw2ApiToken.create(apiToken);
    models.Gw2ApiToken.create(testData.apiToken({
      stub: true,
      token: '1234',
      accountId: '4321',
      id: 2,
    }));
  });

  it('should fetch valid tokens from the db', async () => {
    const tokens = await list(models);

    expect(tokens.length).to.equal(1);
    expect(tokens[0]).to.include(_.omit(apiToken, ['User']));
  });

  describe('replacing invalid token with a valid token', () => {
    const newApiToken = '444-444-333-222';
    const accountName = 'itsmadou.4321';
    let user;

    beforeEach(async () => {
      user = await models.User.create(testData.user({
        id: '938C506D-F838-F447-8B43-4EBF34706E0445B2B504',
        alias: 'itsmadou',
        email: 'heh@eheh.com',
      }));
      await models.Gw2ApiToken.create(testData.apiToken({
        id: 10,
        valid: false,
        token: '4444',
        accountId: '4444',
        accountName,
      }));

      await replace(models, {
        userId: user.id,
        accountName,
        apiToken: newApiToken,
        permissions: ['lol', 'yeah'],
        world: 'Australia',
        accountId: 'cool-place',
      });
    });

    it('should replace invalid token with new user', async () => {
      const replacedApiToken = await models.Gw2ApiToken.findOne({
        where: {
          accountName,
        },
      });

      expect(replacedApiToken).to.include({
        UserId: user.id,
        token: newApiToken,
      });
    });
  });

  describe('validating', () => {
    context('when token isnt valid', () => {
      it('should error', () => {

      });
    });

    context('when token already has been added', () => {
      it('should error', () => {

      });
    });

    context('when another token from the same account has already been added', () => {
      it('should error', () => {

      });
    });

    context('when token doesnt have mandatory permissions', () => {
      it('should error', () => {

      });
    });
  });
});
