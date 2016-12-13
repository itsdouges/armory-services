import * as testData from 'test/testData';
import { read } from './guild';

describe('guilds service', () => {
  let models;

  const guild = testData.guild();

  beforeEach(async () => {
    await global.setupTestDb().then((mdls) => (models = mdls));
  });

  context('reading', () => {
    it('should read a guild', async () => {
      await models.Gw2Guild.create(guild);

      const actual = await read(models, { id: guild.id });

      const { apiToken, ...expected } = guild;

      expect(actual).to.include(expected);
    });
  });
});
