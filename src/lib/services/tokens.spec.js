import _ from 'lodash';
import * as testData from 'test/testData/db';

import { list } from './tokens';

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
