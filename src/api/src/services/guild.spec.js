const service = require('./guild');

describe('guilds service', () => {
  let models;

  const guild = {
    id: '1234-1234-1234',
    tag: 'TAG',
    name: 'CoolGuild',
  };

  beforeEach(() => {
    return global.setupTestDb().then((mdls) => (models = mdls));
  });

  context('reading', () => {
    it('should read a guild', () => {
      return models.Gw2Guild.create(guild)
        .then(() => service.read(models, { id: guild.id }))
        .then((g) => expect(g).to.include(guild));
    });
  });
});
