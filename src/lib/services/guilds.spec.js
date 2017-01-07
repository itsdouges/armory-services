const sandbox = sinon.sandbox.create();
const fetchGuild = sandbox.stub();

const service = proxyquire('lib/services/guilds', {
  'lib/gw2': {
    readGuildPublic: fetchGuild,
  },
});

describe('guilds service', () => {
  const guild = {
    guild_id: '1234-1234-1234-1234',
    guild_name: 'name',
    tag: 'tag',
  };

  let models;

  beforeEach(() => {
    sandbox.reset();

    return global
      .setupTestDb({ seed: true })
      .then((mdls) => (models = mdls));
  });

  context('when guild is not in database', () => {
    it('should fetch data and add guild to database', () => {
      const ids = [guild.guild_id];

      fetchGuild.withArgs(guild.guild_id).returns(Promise.resolve(guild));

      return service.fetch(models, ids)
        .then(() => models.Gw2Guild.findAll())
        .then((guilds) => {
          expect(guilds.length).to.equal(1);

          const [gld] = guilds;

          expect(fetchGuild).to.have.been.calledOnce;

          expect(gld).to.include({
            id: guild.guild_id,
            name: guild.guild_name,
            tag: guild.tag,
          });
        });
    });
  });

  context('when guild is already in database', () => {
    it('should not fetch data', () => {
      const ids = [guild.guild_id];

      fetchGuild.withArgs(guild.guild_id).returns(Promise.resolve(guild));

      return service.fetch(models, ids)
        .then(() => service.fetch(models, ids))
        .then(() => expect(fetchGuild).to.have.been.calledOnce);
    });
  });
});
