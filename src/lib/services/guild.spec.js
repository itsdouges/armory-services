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
    models = await setupTestDb({ seed: true });
    await models.Gw2Guild.create(guild);
  });

  describe('reading', () => {
    it('should read a guild with leader', async () => {
      const actual = await read(models, { id: guild.id });

      const { apiToken, ...expected } = guild;

      expect(actual).to.eql({
        ...expected,
        claimed: true,
        privacy: guild.privacy.split('|'),
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

      const { apiToken, ...expected } = leaderlessGuild;

      expect(actual).to.eql({
        ...expected,
        privacy: leaderlessGuild.privacy.split('|'),
        apiTokenId: null,
        leader: null,
      });
    });
  });

  describe('access', () => {
    it('should allow deny access to something not in privacy', async () => {
      const access = await isAccessAllowed(models, 'dontexist', guild.name);

      expect(access).to.be.false;
    });

    it('should allow access to lol', async () => {
      const access = await isAccessAllowed(models, 'lol', guild.name);

      expect(access).to.be.true;
    });

    it('should force access for members', async () => {
      const access = await isAccessAllowed(models, 'members', guild.name);

      expect(access).to.be.true;
    });
  });
});
