const config = {
  gw2: {
    endpoint: 'gw2http/',
  },
};

const sandbox = sinon.sandbox.create();
const httpGet = sandbox.stub();

const proxyquire = require('proxyquire');

const { guild, characters } = proxyquire('./gw2', {
  axios: {
    get: httpGet,
  },
  '../../config': config,
});

describe('fetch gw2 service', () => {
  afterEach(() => sandbox.reset());

  it('should fetch characters data', () => {
    const token = 'token-1234-abcd';
    const response = { data: 'i am an hero' };

    httpGet
      .withArgs(`${config.gw2.endpoint}v2/characters?page=0&page_size=200`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .returns(Promise.resolve(response));

    return characters(token)
      .then((data) => expect(data).to.equal(response.data));
  });

  it('should fetch guild data', () => {
    const id = 'id-1234-abcd';
    const response = { data: 'i am an guild' };

    httpGet
      .withArgs(`${config.gw2.endpoint}v1/guild_details.json?guild_id=${id}`)
      .returns(Promise.resolve(response));

    return guild(id)
      .then((data) => expect(data).to.equal(response.data));
  });

  it('should retry fetch characters data up to five times if response status was 500', () => {
    const token = 'token-1234-abcd';
    const response = { data: 'i am an hero', status: 500 };

    const withArgsStub = httpGet
      .withArgs(`${config.gw2.endpoint}v2/characters?page=0&page_size=200`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .returns(Promise.reject(response));

    return characters(token)
      .then(null, (data) => expect(data).to.equal(response))
      .then(() => expect(withArgsStub).to.have.been.callCount(5));
  });

  it('should retry to fetch guild up to five times if response status was 500', () => {
    const id = 'id-1234-abcd';
    const response = { data: 'i am an error', status: 500 };

    const withArgsStub = httpGet
      .withArgs(`${config.gw2.endpoint}v1/guild_details.json?guild_id=${id}`)
      .returns(Promise.reject(response));

    return guild(id)
      .then(null, (data) => expect(data).to.equal(response))
      .then(() => expect(withArgsStub).to.have.been.callCount(5));
  });
});
