import * as testData from 'test/testData';

const readUser = sinon.stub();

const sut = proxyquire('fetch/lib/leaderboard', {
  'lib/services/user': {
    read: readUser,
  },
});

const models = { yeah: 'modle' };

describe('leaderboard lib', () => {
  const accountName = 'madou.1234';
  const user = testData.user({
    accountName,
    token: '1234-1234',
  });

  const input = [
    testData.gw2LadderStanding({
      name: accountName,
    }),
  ];

  before(() => {
    readUser.withArgs(models, { accountName }).returns(user);
  });

  it('should replace account name with api token', async () => {
    const actual = await sut(models, input);

    expect(actual).to.eql([{
      apiToken: user.token,
      // TODO: This is bad. Dynamically figure out what the rank
      // is based on leaderboard options.
      rank: input[0].scores[0].value,
    }]);
  });
});
