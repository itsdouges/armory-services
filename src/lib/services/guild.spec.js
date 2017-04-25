import * as testData from 'test/testData/db';
import { read, isAccessAllowed } from './guild';

describe('guilds service', () => {
  let models;

  const user = testData.user();
  const apiTkn = testData.apiToken();
  const guild = testData.guild({
    apiTokenId: 1,
  });

  beforeEach(async () => {
    await setupTestDb({ seed: true }).then((mdls) => (models = mdls));
  });

  describe('reading', () => {
    it('should read a guild with leader', async () => {
      await models.Gw2Guild.create(guild);

      const actual = await read(models, { id: guild.id });

      const { apiToken, apiTokenId, ...expected } = guild;

      expect(actual).to.eql({
        ...expected,
        claimed: true,
        leader: {
          accountName: apiTkn.accountName,
          alias: user.alias,
        },
      });
    });

    it('should read a guild without leader', async () => {
      const leaderlessGuild = testData.guild({
        id: '1111',
      });

      await models.Gw2Guild.create(leaderlessGuild);

      const actual = await read(models, { id: leaderlessGuild.id });

      const { apiToken, apiTokenId, ...expected } = leaderlessGuild;

      expect(actual).to.eql({
        ...expected,
        leader: null,
      });
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
