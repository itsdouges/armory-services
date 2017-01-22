import _ from 'lodash';

import * as testData from 'test/testData';

const createFetchCharacters = ({ characters }) => proxyquire('fetch/fetchers/characters', {
  'lib/gw2': {
    readCharactersDeep: characters,
  },
});

describe('characters fetcher', () => {
  const token = testData.apiToken();
  const character = testData.characterModel();
  const characterTwo = testData.characterModel({
    name: 'maddddou',
  });

  let models;

  beforeEach(async () => {
    models = await setupTestDb({ seed: true, apiToken: token.token });
  });

  const assertCharacter = (actual, expected) => {
    expect(actual.Gw2ApiTokenId).to.equal(token.id);
    expect(actual.dataValues).to.include(_.omit(expected, ['created']));
  };

  it('should replace all characters with response from gw2 api characters', async () => {
    const charactersStub = sinon.stub()
      .withArgs(token.token)
      .returns(Promise.resolve([character, characterTwo]));

    const fetchCharacters = createFetchCharacters({
      characters: charactersStub,
    });

    await fetchCharacters(models, token);

    const [first, second] = await models.Gw2Character.findAll();

    assertCharacter(first, character);
    assertCharacter(second, characterTwo);
  });

  it('should remove characters not brought back and not duplicate chars', async () => {
    const charactersStub = sinon.stub();

    charactersStub
      .onFirstCall()
      .returns(Promise.resolve([character, characterTwo]))
      .onSecondCall()
      .returns(Promise.resolve([characterTwo]));

    const fetchCharacters = createFetchCharacters({
      characters: charactersStub,
    });

    await fetchCharacters(models, token);

    const { dataValues: { id } } = await models.Gw2Character.findOne({
      where: { name: characterTwo.name },
    });

    await fetchCharacters(models, token);
    const firstCharacter = await models.Gw2Character.findOne({
      where: { name: character.name },
    });

    expect(firstCharacter).to.not.exist;

    const secondCharacter = await models.Gw2Character.findAll({
      where: { name: characterTwo.name },
    });
    expect(secondCharacter.length).to.equal(1);
    expect(secondCharacter[0].dataValues.id).to.equal(id);
  });
});
