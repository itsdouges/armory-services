import * as db from 'test/testData/db';
import * as gw2 from 'test/testData/gw2';

const readUser = sinon.stub();

const sut = proxyquire('fetch/lib/leaderboardBuilder', {
  'lib/services/user': {
    read: readUser,
  },
});

const models = { yeah: 'modle' };

describe('leaderboard lib', () => {
  const accountName = 'madou.1234';
  const user = db.user({
    accountName,
    tokenId: 1,
  });

  const input = [
    gw2.leaderboardStanding({
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
      losses: 9,
      wins: 28,
      ratingCurrent: 1775,
      [key]: 201,
      seasonId,
    }]);
  });
});
