import moment from 'frozen-moment';
import { minutes } from 'lib/time';
import * as testData from 'test/testData/db';

const sandbox = sinon.sandbox.create();
const post = sandbox.stub();
const momentStub = sandbox.stub();

const config = {
  fetch: {
    refetchTimeout: minutes(1),
    host: '0.0.0.0',
    port: '80',
  },
};

const { tryFetch } = proxyquire('lib/services/fetch', {
  axios: {
    post,
  },
  config,
  moment: momentStub,
});

describe('fetch service', () => {
  let models;

  const apiToken = testData.apiToken();

  beforeEach(async () => {
    models = await setupTestDb();

    await models.User.create(testData.user());
    const { updatedAt } = await models.Gw2ApiToken.create(apiToken);

    momentStub.withArgs(updatedAt).returns(moment(updatedAt).freeze());
  });

  afterEach(() => sandbox.reset());

  describe('tryFetch', () => {
    it('should fetch if time has passed', async () => {
      momentStub.returns(moment().freeze().add(config.fetch.refetchTimeout));

      await tryFetch(models, apiToken.id);

      expect(post).to.have.been.calledWith(`http://${config.fetch.host}:${config.fetch.port}/fetch`, {
        id: 1,
        permissions: apiToken.permissions,
        token: apiToken.token,
      });
    });

    it('should do nothing if not enough time has passed', async () => {
      momentStub.returns(moment().freeze().add(config.fetch.refetchTimeout - 10));

      await tryFetch(models, apiToken.id);

      expect(post).to.not.have.been.called;
    });

    it('should only start fetching once', async () => {
      momentStub.returns(moment().freeze().add(config.fetch.refetchTimeout));
      let rslv;
      const promise = new Promise((resolve) => (rslv = resolve));
      post.returns(promise);

      setTimeout(rslv, 10);

      await Promise.all([
        tryFetch(models, apiToken.id),
        tryFetch(models, apiToken.id),
        tryFetch(models, apiToken.id),
        tryFetch(models, apiToken.id),
        tryFetch(models, apiToken.id),
        tryFetch(models, apiToken.id),
        tryFetch(models, apiToken.id),
        tryFetch(models, apiToken.id),
      ]);

      expect(post).to.have.been.calledOnce;
    });
  });
});
