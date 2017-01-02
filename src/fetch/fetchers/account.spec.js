const proxyquire = require('proxyquire');

const readAccount = sinon.stub();
const fetch = sinon.stub().returns(Promise.reject());

const fetchAccount = proxyquire('./account', {
  'lib/gw2': {
    readAccount,
  },
  'lib/services/guilds': {
    fetch,
  },
});

describe('account fetcher', () => {
  const token = '1234-1234-1234';

  let models;

  beforeEach(async () => {
    models = await setupTestDb({ seed: true, apiToken: token });
  });

  it('should update token row with data fetched from gw2 account', async () => {
    const accountInfo = {
      world: 100,
      created: '10/20/16:20:20',
      access: 'HeartOfThorns',
      commander: true,
      fractalLevel: 23,
      dailyAp: 30,
      monthlyAp: 40,
      wvwRank: 50,
      guilds: ['cool', 'guild'],
    };

    fetch.withArgs(models, accountInfo.guilds).returns(Promise.resolve());
    readAccount.withArgs(token).returns(Promise.resolve(accountInfo));

    await fetchAccount(models, { token });

    const data = await models.Gw2ApiToken.findOne({
      where: {
        token,
      },
    });

    expect(data.dataValues).to.include(Object.assign({}, accountInfo, {
      guilds: accountInfo.guilds.join(','),
    }));
  });
});
