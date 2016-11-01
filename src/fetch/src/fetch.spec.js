const proxyquire = require('proxyquire');

const config = {
  ping: {
    concurrentCalls: 10,
  },
};

const createPingFactory = (fetchTokenStub) => proxyquire('./fetch', {
  '../config': config,
  './lib/tokens': fetchTokenStub,
});

const assertCalledWithModelAndAllItems = (stub, models, items) => {
  items.forEach((item) => expect(stub).to.have.been.calledWith(models, item));
};

describe('ping', () => {
  let models;

  beforeEach(() => {
    return global
      .setupDb()
      .then((mdls) => (models = mdls));
  });

  it('should call all fetchers with every token', () => {
    const tokens = ['token1', 'token2', 'token3'];

    const fetchTokenStub = sinon.stub().withArgs(models).returns(Promise.resolve(tokens));
    const fetchCharacters = sinon.stub();
    const fetchOtherStuff = sinon.stub();

    const pingFactory = createPingFactory(fetchTokenStub);

    const fetchers = [
      fetchCharacters,
      fetchOtherStuff,
    ];

    const { batchFetch } = pingFactory(models, fetchers);

    return batchFetch()
      .then(() => {
        fetchers.forEach((fetcher) => assertCalledWithModelAndAllItems(fetcher, models, tokens));
      });
  });
});
