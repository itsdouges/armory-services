import * as testData from 'test/testData/db';

import { stubLogger } from 'test/utils';

const config = {
  gitter: {
    apiKey: '1234',
  },
  fetch: {
    concurrentCalls: 10,
  },
};

const createFetchFactory = (fetchTokens) => proxyquire('fetch/userFetch', {
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

    const { fetchAll } = createFetchFactory(fetchTokensStub)(models, [() => {}]);

    return fetchAll();
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
  });
});
