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

const createFetchFactory = (fetchTokens) => proxyquire('fetch/fetch', {
  'lib/services/tokens': fetchTokens,
  config,
});

describe('fetch integration', () => {
  const token = {
    token: 'EE920D9D-F7CF-A146-A5F5-95455980577B0DC68745-969C-4ED9-8462-1299FE6FB078',

  };
  let models;

  beforeEach(async () => {
    models = await setupTestDb({
      seed: true,
      apiToken: token.token,
    });
  });

  const initiateFetch = (tokens = []) => {
    const fetchTokensStub = sinon.stub().returns(Promise.resolve(tokens));

    const { batchFetch } = createFetchFactory(fetchTokensStub)(
      models,
      [accountFetcher, characterFetcher]
    );

    return batchFetch();
  };

  it('should not explode if fetching with no tokens', () => {
    return initiateFetch();
  });

  it('should not explode if fetching with some bad and some good tokens', async function () {
    this.timeout(50000);

    await initiateFetch([
      'dont-exist-lol',
      token,
    ]);

    const characters = await models.Gw2Character.findAll();
    expect(characters.length).to.be.above(5);

    const guilds = await models.Gw2Guild.findAll();
    expect(guilds.length).to.be.at.least(1);
  });
});
