import * as testData from 'test/testData';
import { list } from './character';

describe('character service', () => {
  const guild = 'cool-guild';
  let models;

  const characters = [
    testData.character({ guild }),
    testData.character({ guild }),
  ];

  const user = testData.user();
  const apiToken = testData.apiToken();

  before(async () => {
    models = await setupTestDb();

    await models.User.create(user);
    await models.Gw2ApiToken.create(testData.apiToken());
    await models.Gw2Character.create(characters[0]);
    await models.Gw2Character.create(characters[1]);
    await models.Gw2Character.create(testData.character());
  });

  it('should return all characters in guild', () => {
    return list(models, { guild }).should.eventually.become([{
      name: characters[0].name,
      gender: characters[0].gender,
      profession: characters[0].profession,
      level: characters[0].level,
      race: characters[0].race,
      userAlias: user.alias,
      world: apiToken.world,
      accountName: apiToken.accountName,
    }, {
      name: characters[0].name,
      gender: characters[0].gender,
      profession: characters[0].profession,
      level: characters[0].level,
      race: characters[0].race,
      userAlias: user.alias,
      world: apiToken.world,
      accountName: apiToken.accountName,
    }]);
  });
});
