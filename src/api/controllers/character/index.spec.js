import * as testData from 'test/testData/db';
import _ from 'lodash';

const sandbox = sinon.sandbox.create();
const readCharacter = sandbox.stub();
const tryFetch = sandbox.spy();

const controllerFactory = proxyquire('api/controllers/character', {
  'lib/gw2': {
    readCharacter,
  },
  'lib/services/fetch': { tryFetch },
});

describe('character controller', () => {
  let models;
  let controller;

  const email = 'email@email.com';
  const user = testData.user({ email });
  const apiToken = testData.apiToken();
  const guild = testData.guild();
  const characterOne = testData.character({ name: 'madoooo', guild: guild.id });
  const characterTwo = testData.character({ name: 'ayyyyy', showPublic: false });
  const characterThree = testData.character({ name: 'CoolCharacter' });

  const setupTestData = async () => {
    await models.User.create(user);
    await models.Gw2ApiToken.create(apiToken);
    await models.Gw2Guild.create(guild);
    await models.Gw2Character.create(characterOne);
    await models.Gw2Character.create(characterTwo);
    await models.Gw2Character.create(characterThree);
  };

  beforeEach(async () => {
    models = await setupTestDb();
    await setupTestData();
    controller = controllerFactory(models);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('reading character', () => {
    it('should reject if character name is not in our db', async () => {
      try {
        await controller.read('noname');
      } catch (e) {
        expect(e).to.eql(new Error('Unauthorized'));
      }
    });

    it('should throw if email doesnt match', async () => {
      try {
        await controller.read(characterOne.name, { ignorePrivacy: true, email: 'notcool@email' });
      } catch (e) {
        expect(e).to.eql(new Error('Unauthorized'));
      }
    });

    it('should call gw2api if it is in our db', async () => {
      const apiData = {
        neat: 'gears',
      };

      readCharacter.withArgs(apiToken.token, characterOne.name).returns(Promise.resolve(apiData));

      const data = await controller.read(characterOne.name, { ignorePrivacy: true, email });

      expect(tryFetch).to.have.been.calledWith(models, apiToken.id);

      expect(data).to.eql({
        authorization: {
          showPublic: true,
          showGuild: true,
        },
        accountName: apiToken.accountName,
        guild_tag: guild.tag,
        guild_name: guild.name,
        alias: user.alias,
        ...apiData,
      });
    });

    it('should call api with show all', async () => {
      readCharacter.withArgs(apiToken.token, characterOne.name).returns(Promise.resolve({}));

      const data = await controller.read(characterOne.name, { ignorePrivacy: false });

      expect(data).to.eql({
        guild_tag: guild.tag,
        guild_name: guild.name,
        authorization: {
          showPublic: true,
          showGuild: true,
        },
        accountName: apiToken.accountName,
        alias: user.alias,
        apiTokenAvailable: true,
      });
    });

    it('should hide character if showPublic is false', async () => {
      readCharacter.returns(Promise.resolve({}));

      try {
        await controller.read(characterTwo.name);
      } catch (e) {
        expect(e).to.eql(new Error('Unauthorized'));
      }
    });

    it('should show character is showPublic is false and ignorePrivacy is true', async () => {
      readCharacter.returns(Promise.resolve({}));

      const data = await controller.read(characterTwo.name, { ignorePrivacy: true, email });

      expect(data).to.eql({
        authorization: {
          showPublic: false,
          showGuild: true,
        },
        accountName: apiToken.accountName,
        alias: user.alias,
        apiTokenAvailable: true,
      });
    });
  });

  describe('character lists', () => {
    context('when ignoring privacy', async () => {
      it('should return all characters by email', async () => {
        const list = await controller.list({ email, ignorePrivacy: true });
        expect(list.rows.length).to.equal(3);
      });

      it('should return all characters by alias', async () => {
        const list = await controller.list({ alias: user.alias, email, ignorePrivacy: true });
        expect(list.rows.length).to.equal(3);
      });
    });

    context('when privacy is on', () => {
      it('should return all characters by email', async () => {
        const list = await controller.list({ alias: user.alias });

        expect(list.rows.length).to.equal(2);

        const [charOne, charTwo] = list.rows;

        expect(charOne).to.eql({
          ..._.pick(characterOne, [
            'gender',
            'level',
            'name',
            'profession',
            'race',
          ]),
          accountName: apiToken.accountName,
          userAlias: user.alias,
          world: apiToken.world,
        });

        expect(charTwo).to.eql({
          ..._.pick(characterThree, [
            'gender',
            'level',
            'name',
            'profession',
            'race',
          ]),
          accountName: apiToken.accountName,
          userAlias: user.alias,
          world: apiToken.world,
        });
      });

      it('should return all characters by alias', async () => {
        const list = await controller.list({ alias: user.alias });
        expect(list.rows.length).to.equal(2);

        const [charOne, charTwo] = list.rows;

        expect(charOne).to.eql({
          ..._.pick(characterOne, [
            'gender',
            'level',
            'name',
            'profession',
            'race',
          ]),
          accountName: apiToken.accountName,
          userAlias: user.alias,
          world: apiToken.world,
        });

        expect(charTwo).to.eql({
          ..._.pick(characterThree, [
            'gender',
            'level',
            'name',
            'profession',
            'race',
          ]),
          accountName: apiToken.accountName,
          userAlias: user.alias,
          world: apiToken.world,
        });
      });
    });
  });

  describe('reading random character name', () => {
    it('should return a character name', async () => {
      const expectedNames = [characterOne.name, characterThree.name];

      const [name] = await controller.random(1);
      expect(expectedNames).to.include(name);
    });
  });

  describe('updating character', () => {
    it('should reject if character doesnt belong to email', async () => {
      try {
        await controller.update('bad-email', { name: characterOne.name });
      } catch (e) {
        expect(e).to.eql(new Error('Not your character'));
      }
    });

    it('should resolve and update if character belongs to email', async () => {
      await controller.update(email, {
        name: characterOne.name,
        showPublic: false,
        showBuilds: false,
        showPvp: false,
        showBags: false,
        showGuild: false,
      });

      const character = await models.Gw2Character.findOne({ where: { name: characterOne.name } });
      expect(character).to.include({
        showPublic: false,
        showBuilds: false,
        showPvp: false,
        showBags: false,
        showGuild: false,
      });
    });
  });
});
