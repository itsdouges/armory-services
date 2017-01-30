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
    tokenId: 1,
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
    const key = 'naRank';
    const seasonId = '1234-1234';

    const actual = await sut(models, input, {
      key,
      seasonId,
    });

    expect(actual).to.eql([{
      apiTokenId: user.tokenId,
      deaths: 9,
      kills: 28,
      ratingCurrent: 1775,
      [key]: 201,
      seasonId,
    }]);
  });
});
