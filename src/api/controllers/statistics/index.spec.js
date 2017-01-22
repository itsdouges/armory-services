import * as testData from 'test/testData';

const controllerFactory = require('./');

const setupTestData = async (models) => {
  await models.User.create(testData.user());
  await models.Gw2ApiToken.create(testData.apiToken());
  await models.Gw2Guild.create(testData.guild());
  await models.Gw2Character.create(testData.character());
  await models.Gw2Character.create(testData.character({
    name: 'ayyyy',
    gender: 'Female',
    guild: '',
    profession: 'Necromancer',
    race: 'Human',
  }));
};

describe('statistics', () => {
  let models;
  let controller;

  beforeEach(async () => {
    models = await setupTestDb(true, {
      email: 'email@email.com',
      alias: 'cool-name',
      addTokens: true,
    });

    controller = controllerFactory(models);

    await setupTestData(models);
  });

  it('should return user stats', async () => {
    const stats = await controller.users();

    expect(stats).to.eql({
      count: 1,
    });
  });

  it('should return guild stats', async () => {
    const stats = await controller.guilds();

    expect(stats).to.eql({
      count: 1,
    });
  });

  it('should return character stats', async () => {
    const stats = await controller.characters();

    expect(stats).to.eql({
      count: 2,
      gender: {
        Male: 1,
        Female: 1,
      },
      race: {
        Asura: 1,
        Human: 1,
      },
      profession: {
        Necromancer: 1,
        Elementalist: 1,
      },
      level: {
        20: 2,
      },
      guild: {
        yes: 1,
        no: 1,
      },
    });
  });
});
