import { parseResults } from 'lib/logger';
import { stubLogger } from 'test/utils';

const config = {
  fetch: {
    concurrentCalls: 1,
  },
  gitter: {
    apiKey: '1234',
  },
};

const createFetchFactory = (fetchTokenStub) => proxyquire('fetch/userFetch', {
  config,
  'lib/services/tokens': { list: fetchTokenStub },
  ...stubLogger(),
});

const fetchersShouldHaveBeenCalledWithModelsAndTokens = (fetcher, models, tokens) => {
  tokens.forEach((token) => expect(fetcher).to.have.been.calledWith(models, token));
};

describe('fetch', () => {
  const tokens = ['token1', 'token2', 'token3'];

  let fetchers;
  let models;
  let failingFetcher;
  let result;

  beforeEach(async () => {
    const mdls = await setupTestDb();

    models = mdls;

    const fetchTokenStub = sinon.stub().withArgs(models).returns(Promise.resolve(tokens));
    const fetchFactory = createFetchFactory(fetchTokenStub);

    fetchers = [
      sinon.stub(),
      sinon.stub(),
      sinon.stub(),
      sinon.stub(),
    ];

    fetchers.forEach((fetcher) => {
      tokens.forEach((token) => {
        fetcher.withArgs(models, token).returns(Promise.resolve('success!'));
      });
    });

    failingFetcher = sinon.stub();
    tokens.forEach((token) => {
      failingFetcher.withArgs(models, token).returns(Promise.reject('failed fetch'));
    });

    fetchers.push(failingFetcher);

    const { fetchAll } = fetchFactory(models, fetchers);

    result = await fetchAll();
  });

  it('should call all fetchers with every token', async () => {
    fetchers.forEach(
      (fetcher) => fetchersShouldHaveBeenCalledWithModelsAndTokens(fetcher, models, tokens)
    );
  });

  it('should call each fetcher in succession', () => {
    const { errors, successes } = parseResults(result);

    expect(errors.length).to.equal(1 * tokens.length);
    expect(successes.length).to.equal(4 * tokens.length);
  });
});
