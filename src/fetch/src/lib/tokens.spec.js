const fetchTokens = require('./tokens');

describe('fetch token service', () => {
  let models;

  beforeEach(() => {
    return global
      .setupDb({ seedDb: true })
      .then((mdls) => (models = mdls));
  });

  it('should fetch valid tokens from the db', () => {
    return fetchTokens(models)
      .then((items) => {
        expect(items).to.eql([{
          token: '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15',
          permissions: 'cool,permissions',
        },
        {
          token: '25E6FAC3-1912-7E47-9420-2965C5E4D63DEAA54B0F-092E-48A8-A2AE-9E197DF4BC8B',
          permissions: 'cool,permissions',
        },
        ]);
      });
  });
});
