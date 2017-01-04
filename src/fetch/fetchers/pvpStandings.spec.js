import { standing } from 'test/testData';

const sandbox = sinon.sandbox.create();
const readPvpStandings = sandbox.stub();

const pvpStandingsFetcher = proxyquire('fetch/fetchers/pvpStandings', {
  'lib/gw2': {
    readPvpStandings,
  },
});

describe('pvp standings fetcher', () => {
  let models;
  const token = '1234-1234-1234';
  const standings = [
    standing({
      seasonId: '1111',
    }),
    standing({
      seasonId: '2222',
    }),
    standing({
      seasonId: '3333',
    }),
  ];

  before(async () => {
    models = await setupTestDb({ seed: true, apiToken: token });
    readPvpStandings.withArgs(token).returns(Promise.resolve(standings));
    await pvpStandingsFetcher(models, { token });
  });

  it('should insert all pvp data into db', async () => {
    const rows = await models.PvpStandings.findAll();

    rows.map((row) => row.dataValues).forEach((row, index) => {
      const pvpStanding = standings[index];

      expect(row).to.include({
        seasonId: pvpStanding.seasonId,
        totalPointsCurrent: pvpStanding.current.totalPoints,
        divisionCurrent: pvpStanding.current.division,
        pointsCurrent: pvpStanding.current.points,
        repeatsCurrent: pvpStanding.current.repeats,
        ratingCurrent: pvpStanding.current.rating,
        totalPointsBest: pvpStanding.best.totalPoints,
        divisionBest: pvpStanding.best.division,
        pointsBest: pvpStanding.best.points,
        repeatsBest: pvpStanding.best.repeats,
        apiToken: token,
      });
    });
  });
});
