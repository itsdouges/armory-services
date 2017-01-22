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

  const token = 1;
  const standings = [
    standing({
      season_id: '1111',
    }),
    standing({
      season_id: '2222',
    }),
    standing({
      season_id: '3333',
    }),
  ];

  before(async () => {
    models = await setupTestDb({ seed: true, apiToken: token });
    readPvpStandings.withArgs(token).returns(Promise.resolve(standings));
    await pvpStandingsFetcher(models, { token });
  });

  it('should insert all pvp data into db', async () => {
    const rows = await models.PvpStandings.findAll();

    expect(rows.length).to.equal(standings.length);
    rows.map((row) => row.dataValues).forEach((row, index) => {
      const pvpStanding = standings[index];

      expect(row).to.include({
        seasonId: pvpStanding.season_id,
        apiToken: token,

        totalPointsCurrent: pvpStanding.current.total_points,
        divisionCurrent: pvpStanding.current.division,
        pointsCurrent: pvpStanding.current.points,
        repeatsCurrent: pvpStanding.current.repeats,
        ratingCurrent: pvpStanding.current.rating,
        decayCurrent: pvpStanding.current.decay,

        totalPointsBest: pvpStanding.best.total_points,
        divisionBest: pvpStanding.best.division,
        pointsBest: pvpStanding.best.points,
        repeatsBest: pvpStanding.best.repeats,
        ratingBest: pvpStanding.best.rating,
        decayBest: pvpStanding.best.decay,
      });
    });
  });
});
