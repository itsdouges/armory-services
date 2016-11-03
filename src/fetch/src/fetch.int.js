const proxyquire = require('proxyquire');

const createFetchFactory = (fetchTokens) => proxyquire('./fetch', {
  './lib/tokens': fetchTokens,
});
const characterFetcher = require('./fetchers/characters');

describe('fetch integration', () => {
  const token = 'EE920D9D-F7CF-A146-A5F5-95455980577B0DC68745-969C-4ED9-8462-1299FE6FB078';
  let models;

  beforeEach(() => {
    return global
      .setupDb({
        seedDb: true,
        token,
      })
      .then((mdls) => (models = mdls));
  });

  const initiateFetch = (tokens = []) => {
    const fetchTokensStub = sinon.stub().returns(Promise.resolve(tokens));

    const { batchFetch } = createFetchFactory(fetchTokensStub)(models, [characterFetcher]);
    return batchFetch();
  };

  it('should not explode if fetching with no tokens', () => {
    return initiateFetch();
  });

  it('should not explode if fetching with some bad and some good tokens', function () {
    this.timeout(40000);

    return initiateFetch([
      'dont-exist-lol',
      token,
    ])
    .then(() => models.Gw2Character.findAll())
    .then((characters) => expect(characters.length).to.be.above(5))
    .then(() => models.Gw2Guild.findAll())
    .then((guilds) => expect(guilds.length).to.be.at.least(1));
  });
});
