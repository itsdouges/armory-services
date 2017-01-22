import * as testData from 'test/testData';

import { stubLogger } from 'test/utils';
import characterFetcher from './fetchers/characters';
import accountFetcher from './fetchers/account';

const config = {
  gitter: {
    apiKey: '1234',
  },

  fetch: {
    concurrentCalls: 10,
  },
};

const createFetchFactory = (fetchTokens) => proxyquire('fetch/tokenFetch', {
  'lib/services/tokens': { list: fetchTokens },
  config,
  ...stubLogger(),
});

describe('fetch integration', () => {
  const user = testData.user();
  const apiToken = testData.apiToken();

  let models;

  beforeEach(async () => {
    models = await setupTestDb();
    models.User.create(user);
    models.Gw2ApiToken.create(apiToken);
  });

  const initiateFetch = (tokens = []) => {
    const fetchTokensStub = sinon.stub().returns(Promise.resolve(tokens));

    const { batchFetch } = createFetchFactory(fetchTokensStub)(models, [
      accountFetcher,
      characterFetcher,
    ]);

    return batchFetch();
  };

  it('should not explode if fetching with no tokens', () => {
    return initiateFetch();
  });

  it('should not explode if fetching with some bad and some good tokens', async function () {
    this.timeout(50000);

    await initiateFetch([
      'dont-exist-lol',
      apiToken,
    ]);

    const characters = await models.Gw2Character.findAll();
    expect(characters.length).to.be.above(5);

    const guilds = await models.Gw2Guild.findAll();
    expect(guilds.length).to.be.at.least(1);
  });
});
