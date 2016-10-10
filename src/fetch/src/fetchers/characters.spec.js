const proxyquire = require('proxyquire');

const sandbox = sinon.sandbox.create();

const gw2 = {
  characters: sandbox.stub(),
  guild: sandbox.stub(),
};

const fetchCharacters = proxyquire('./characters', {
  '../lib/gw2': gw2,
});

describe('characters fetcher', () => {
  const character = {
    name: 'character1',
    race: 'race',
    gender: 'gender',
    profession: 'profession',
    level: 69,
    created: 20,
    age: 20,
    deaths: 2,
  };

  const guild = {
    guild_id: 'cool-guild',
    guild_name: 'name',
    tag: 'tag',
  };

  let models;

  beforeEach(() => {
    return global
      .setupDb({ seedDb: true })
      .then((mdls) => (models = mdls));
  });

  it('should replace all characters with response from gw2 api characters', () => {
    const token = '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15';

    gw2.characters.withArgs(token).returns(Promise.resolve([character, character]));

    return fetchCharacters(models, token)
      .then(() => {
        return models.Gw2Character.findAll({});
      })
      .then((chars) => {
        expect(chars.length).to.equal(2);

        chars.forEach((char) => {
          expect(char.Gw2ApiTokenToken).to.equal(token);
          expect(char.dataValues).to.include(character);
        });
      });
  });

  it('should add guild if character is in one, only once', () => {
    const token = '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15';

    const characterWithGuild = Object.assign({}, character, { guild: guild.guild_name });

    gw2.characters.withArgs(token).returns(
      Promise.resolve([characterWithGuild])
    );

    gw2.guild.withArgs(guild.guild_name).returns(Promise.resolve(guild));

    return fetchCharacters(models, token)
      .then(() => fetchCharacters(models, token))
      .then(() => models.Gw2Guild.findAll())
      .then((guilds) => {
        expect(guilds.length).to.equal(1);

        const [gld] = guilds;

        expect(gw2.guild).to.have.been.calledOnce;

        expect(gld).to.include({
          id: guild.guild_id,
          name: guild.guild_name,
          tag: guild.tag,
        });
      });
  });
});
