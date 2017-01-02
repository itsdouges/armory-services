const Models = require('lib/models');
const controller = require('./index');

describe('search controller', () => {
  let models;
  let systemUnderTest;

  function seed () {
    return models.User.create({
      alias: 'madou',
      email: 'laheen@gmail.com',
      passwordHash: 'okreally',
    })
    .then((user) => {
      return models.Gw2ApiToken.create({
        token: 'A-TOKEN!!',
        accountName: 'accName',
        permissions: 'stuff',
        world: 'hah',
        accountId: 'idid',
        UserId: user.id,
        primary: true,
      });
    })
    .then((token) => {
      return Promise.all([
        models.Gw2Character.create({
          name: 'aaamadouuuu',
          race: 'girl',
          gender: 'M',
          profession: 'carpenter',
          level: 1,
          created: new Date(),
          age: 1,
          deaths: 0,
          Gw2ApiTokenToken: token.token,
        }),
        models.Gw2Character.create({
          name: 'adoooooo',
          race: 'girl',
          gender: 'M',
          profession: 'carpenter',
          level: 1,
          showPublic: false,
          created: new Date(),
          age: 1,
          deaths: 0,
          Gw2ApiTokenToken: token.token,
        })]);
    })
    .then(() => {
      return models.Gw2Guild.create({
        name: 'guildOfMadou',
        id: 'guild-swag',
        tag: 'heytag',
      });
    });
  }

  beforeEach(async () => {
    models = await setupTestDb();

    systemUnderTest = controller(models);
  });

  describe('simple', () => {
    it('should expose all resources like search term that is publicly available', (done) => {
      seed().then(() => {
        systemUnderTest.search('ado')
          .then((results) => {
            expect(results).to.eql([{
              resource: 'users',
              name: 'madou',
              accountName: 'accName',
            }, {
              resource: 'characters',
              name: 'aaamadouuuu',
              accountName: 'accName',
              alias: 'madou',
              level: 1,
              profession: 'carpenter',
              race: 'girl',
            }, {
              resource: 'guilds',
              name: 'guildOfMadou',
              tag: 'heytag',
            }]);

            done();
          });
      });
    });
  });
});
