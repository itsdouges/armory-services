import { list } from './tokens';

describe('fetch token service', () => {
  let models;

  beforeEach(() => {
    return setupTestDb({ seed: true })
      .then((mdls) => (models = mdls));
  });

  it('should fetch valid tokens from the db', () => {
    return list(models)
      .then((items) => {
        expect(items).to.eql([{
          token: '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15',
          permissions: 'cool,permissions',
        },
        {
          token: '25E6FAC3-1912-7E47-9420-2965C5E4D63DEAA54B0F-092E-48A8-A2AE-9E197DF4BC8B',
          permissions: 'cool,permissions',
        },
        {
          token: 'cool_token',
          permissions: 'he,he',
        },
        {
          token: 'another_token',
          permissions: 'he,he',
        }]);
      });
  });

  describe('validating', () => {
    context('when token isnt valid', () => {
      it('should error', () => {

      });
    });

    context('when token already has been added', () => {
      it('should error', () => {

      });
    });

    context('when another token from the same account has already been added', () => {
      it('should error', () => {

      });
    });

    context('when token doesnt have mandatory permissions', () => {
      it('should error', () => {

      });
    });
  });
});
