const proxyquire = require('proxyquire');

const account = sinon.stub();

const fetchAccount = proxyquire('./account', {
  '../lib/gw2': {
    account,
  },
});

describe('account fetcher', () => {
  const token = '1234-1234-1234';

  let models;

  beforeEach(() => global.setupDb({ seedDb: true, token }).then((m) => (models = m)));

  it('should update token row with data fetched from gw2 account', () => {
    const accountData = {
      world: 100,
      created: '10/20/16:20:20',
      access: 'HeartOfThorns',
      commander: true,
      fractalLevel: 23,
      dailyAp: 30,
      monthlyAp: 40,
      wvwRank: 50,
    };

    account.withArgs(token).returns(Promise.resolve(accountData));

    return fetchAccount(models, token)
      .then(() => models.Gw2ApiToken.findOne({
        where: {
          token,
        },
      }))
      .then(({ dataValues }) => {
        expect(dataValues).to.include(accountData);
      });
  });
});
