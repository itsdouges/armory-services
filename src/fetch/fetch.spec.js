import { stubLogger, stubInterval } from 'test/utils';

const fetch = proxyquire('fetch/fetch', {
  ...stubLogger,
});

const interval = sinon.spy();

describe('fetch', () => {
  stubInterval(interval);

  const models = { Users: {} };
  const fetchers = [
    { fetcher: sinon.spy(), interval: 20, callImmediately: true },
    { fetcher: sinon.spy(), interval: 40, callImmediately: false },
  ];

  beforeEach(() => {
    interval.reset();
    fetch(models, fetchers);
  });

  it('should set interval for every fetcher', () => {
    setInterval.getCalls().forEach((call, index) => {
      const [cb, time] = call.args;

      cb();

      expect(fetchers[index].fetcher).to.have.been.called;
      expect(fetchers[index].interval).to.equal(time);
    });
  });

  it('should trigger fetch immediately if fetcher mandates it', () => {
    expect(fetchers[0].fetcher).to.have.been.called;
  });
});
