const token = require('./index');
const Models = require('lib/models');
const axios = require('axios');

describe('gw2 token validator', () => {
  let models;

  beforeEach(async () => {
    models = await setupTestDb();
  });

  it('should call real endpoint and resolve', function () {
    this.timeout(40000);

    // eslint-disable-next-line
    return token('token', '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15', {
      axios,
      env: {
        gw2: {
          endpoint: 'https://api.guildwars2.com/',
        },
      },
      models,
    }).then((e) => {
      expect(e).not.to.exist;
    });
  });

  it('should call real endpoint and resolve error', function () {
    this.timeout(40000);

    return token('token', 'invalid', {
      axios,
      env: {
        gw2: {
          endpoint: 'https://api.guildwars2.com/',
        },
      },
      models,
    }).then((e) => {
      expect(e).to.eql({
        property: 'token',
        message: 'invalid token',
      });
    });
  });
});
