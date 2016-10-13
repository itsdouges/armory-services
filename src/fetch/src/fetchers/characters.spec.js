const proxyquire = require('proxyquire');

const createFetchCharacters = ({ characters, guild }) => proxyquire('./characters', {
  '../lib/gw2': {
    characters,
    guild,
  },
});

describe('characters fetcher', () => {
  const token = '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15';

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
    guild_id: '1234-1234-1234-1234',
    guild_name: 'name',
    tag: 'tag',
  };

  let models;

  beforeEach(() => {
    return global
      .setupDb({ seedDb: true, token })
      .then((mdls) => (models = mdls));
  });

  it('should replace all characters with response from gw2 api characters', () => {
    const charactersStub = sinon.stub().withArgs(token)
      .returns(Promise.resolve([character, character]));

    const fetchCharacters = createFetchCharacters({
      characters: charactersStub,
    });

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
    const characterWithGuild = Object.assign({}, character, { guild: guild.guild_id });

    const charactersStub = sinon.stub().withArgs(token).returns(
      Promise.resolve([characterWithGuild, characterWithGuild, characterWithGuild])
    );

    const guildStub = sinon.stub().withArgs(guild.guild_id).returns(Promise.resolve(guild));

    const fetchCharacters = createFetchCharacters({
      characters: charactersStub,
      guild: guildStub,
    });

    return fetchCharacters(models, token)
      .then(() => fetchCharacters(models, token))
      .then(() => models.Gw2Guild.findAll())
      .then((guilds) => {
        expect(guilds.length).to.equal(1);

        const [gld] = guilds;

        expect(guildStub).to.have.been.calledOnce;

        expect(gld).to.include({
          id: guild.guild_id,
          name: guild.guild_name,
          tag: guild.tag,
        });
      });
  });

  it('should remove characters not brought back', () => {
    const otherCharacter = Object.assign({}, character, { name: 'anotherName' });

    const charactersStub = sinon.stub();

    charactersStub.onFirstCall()
      .returns(Promise.resolve([character, otherCharacter]))
      .onSecondCall()
      .returns(Promise.resolve([otherCharacter]));

    const fetchCharacters = createFetchCharacters({
      characters: charactersStub,
    });

    return fetchCharacters(models, token)
      .then(() => models.Gw2Character.findOne({ where: { name: otherCharacter.name } }))
      .then(({ dataValues: { id } }) => {
        return fetchCharacters(models, token)
          .then(() => {
            return models.Gw2Character.findOne({ where: { name: character.name } });
          })
          .then((char) => {
            expect(char).to.not.exist;
          })
          .then(() => {
            return models.Gw2Character.findOne({ where: { name: otherCharacter.name } });
          })
          .then((char) => {
            expect(char.dataValues.id).to.equal(id);
          });
      });
  });
});
