const createFetchCharacters = ({ characters }) => proxyquire('fetch/fetchers/characters', {
  'lib/gw2': {
    readCharactersDeep: characters,
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

  let models;

  beforeEach(() => {
    return setupTestDb({ seed: true, ApiToken: token })
      .then((mdls) => (models = mdls));
  });

  it('should replace all characters with response from gw2 api characters', () => {
    const charactersStub = sinon.stub().withArgs(token)
      .returns(Promise.resolve([character, character]));

    const fetchCharacters = createFetchCharacters({
      characters: charactersStub,
    });

    return fetchCharacters(models, { token })
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

  it('should remove characters not brought back and not duplicate chars', () => {
    const otherCharacter = Object.assign({}, character, { name: 'anotherName' });

    const charactersStub = sinon.stub();

    charactersStub.onFirstCall()
      .returns(Promise.resolve([character, otherCharacter]))
      .onSecondCall()
      .returns(Promise.resolve([otherCharacter]));

    const fetchCharacters = createFetchCharacters({
      characters: charactersStub,
    });

    return fetchCharacters(models, { token })
      .then(() => models.Gw2Character.findOne({ where: { name: otherCharacter.name } }))
      .then(({ dataValues: { id } }) => {
        return fetchCharacters(models, { token })
          .then(() => {
            return models.Gw2Character.findOne({ where: { name: character.name } });
          })
          .then((char) => {
            expect(char).to.not.exist;
          })
          .then(() => {
            return models.Gw2Character.findAll({ where: { name: otherCharacter.name } });
          })
          .then((char) => {
            expect(char.length).to.equal(1);
            expect(char[0].dataValues.id).to.equal(id);
          });
      });
  });
});
