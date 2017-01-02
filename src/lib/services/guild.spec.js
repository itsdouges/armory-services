import * as testData from 'test/testData';
import { read, isAccessAllowed } from './guild';

describe('guilds service', () => {
  let models;

  const guild = testData.guild();

  beforeEach(async () => {
    await setupTestDb().then((mdls) => (models = mdls));
  });

  describe('reading', () => {
    it('should read a guild', async () => {
      await models.Gw2Guild.create(guild);

      const actual = await read(models, { id: guild.id });

      const { apiToken, ...expected } = guild;

      expect(actual).to.include(expected);
    });
  });

  describe('access', () => {
    it('should not give access', async () => {
      const access = await isAccessAllowed();

      expect(access).to.be.false;
    });

    it('should give access for members', async () => {
      const access = await isAccessAllowed();

      expect(access).to.be.false;
    });
  });
});
