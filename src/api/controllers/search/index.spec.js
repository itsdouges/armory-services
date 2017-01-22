import * as testData from 'test/testData';
import controller from './';

describe('search controller', () => {
  let models;
  let systemUnderTest;

  const user = testData.user({
    alias: 'madou',
  });

  const apiToken = testData.apiToken({ primary: true });
  const character = testData.character();
  const guild = testData.guild({
    name: 'Guild Of Madou',
  });

  async function seed () {
    await models.User.create(user);
    await models.Gw2ApiToken.create(apiToken);
    await models.Gw2Character.create(character);
    await models.Gw2Guild.create(guild);
  }

  beforeEach(async () => {
    models = await setupTestDb();
    await seed();
    systemUnderTest = controller(models);
  });

  describe('simple', () => {
    it('should expose all resources like search term that is publicly available', async () => {
      const results = await systemUnderTest.search('ma');

      expect(results).to.eql([{
        resource: 'users',
        name: user.alias,
        accountName: apiToken.accountName,
      }, {
        resource: 'characters',
        name: character.name,
        accountName: apiToken.accountName,
        alias: user.alias,
        level: character.level,
        profession: character.profession,
        race: character.race,
      }, {
        resource: 'guilds',
        name: guild.name,
        tag: guild.tag,
      }]);
    });
  });
});
