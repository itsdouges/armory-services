const proxyquire = require('proxyquire');

const createPingFactory = (fetchTokens) => proxyquire('./ping', {
  './lib/tokens': fetchTokens,
});
const characterFetcher = require('./fetchers/characters');

describe('ping controller', () => {
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

  const initiatePing = (tokens = []) => {
    const fetchTokensStub = sinon.stub().returns(Promise.resolve(tokens));

    const ping = createPingFactory(fetchTokensStub)(models, [characterFetcher]);
    return ping();
  };

  it('should not explode if fetching with no tokens', () => {
    return initiatePing();
  });

  it('should not explode if fetching with some bad and some good tokens', function () {
    this.timeout(40000);

    return initiatePing([
      'dont-exist-lol',
      token,
    ])
    .then(() => models.Gw2Character.findAll())
    .then((characters) => expect(characters.length).to.be.above(5))
    .then(() => models.Gw2Guild.findAll())
    .then((guilds) => expect(guilds.length).to.be.at.least(1));
  });
});
