const controllerFactory = require('./index');
const Models = require('../../models');
const testDb = require('../../../spec/helpers/db');

describe('character controller', () => {
  let controller;
  let mockGw2Api;
  let models;

  beforeEach((done) => {
    models = new Models(testDb());
    models.sequelize.sync({
      force: true,
    })
    .then(done);

    mockGw2Api = {
      readCharacter () {},
    };

    controller = controllerFactory(models, mockGw2Api);
  });

  it('should reject if character name is not in our db', (done) => {
    controller
      .read('noname')
      .then(null, done);
  });

  it('should reject if email doesnt match', (done) => {
    models
      .User
      .create({
        email: 'cool@email',
        passwordHash: 'coolpassword',
        alias: 'madou',
      })
      .then(() => {
        return models
          .User
          .findOne({
            where: {
              email: 'cool@email',
            },
          });
      })
      .then((data) => {
        return models
          .Gw2ApiToken
          .create({
            token: 'swag',
            accountName: 'nameyname',
            accountId: 'haah',
            permissions: 'cool,permissions',
            world: 1234,
            UserId: data.id,
          });
      })
      .then(() => {
        return models
          .Gw2Character
          .create({
            Gw2ApiTokenToken: 'swag',
            name: 'blastrn',
            gender: 'ay',
            profession: 'hehe',
            level: 123,
            created: new Date(),
            age: 1,
            race: 'ay',
            deaths: 1,
          });
      })
      .then(() => {
        return controller.read('blastrn', true, 'notcool@email');
      })
      .then(null, done);
  });

  // the orchestration to get this unit test running is a bit crazy..
  // dont really want to mock out the db though. no point when we can
  // test in memory. ill think about it.
  it('should call gw2api if it is in our db', (done) => {
    spyOn(mockGw2Api, 'readCharacter').and.returnValue(Promise.resolve({}));

    models
      .User
      .create({
        email: 'cool@email',
        passwordHash: 'coolpassword',
        alias: 'madou',
      })
      .then(() => {
        return models
            .User
            .findOne({
              where: {
                email: 'cool@email',
              },
            });
      })
      .then((data) => {
        return models
          .Gw2ApiToken
          .create({
            token: 'swag',
            accountName: 'nameyname',
            accountId: 'haah',
            permissions: 'cool,permissions',
            world: 1234,
            UserId: data.id,
          });
      })
      .then(() => {
        return models
          .Gw2Guild
          .create({
            name: 'Guild Name',
            id: 'guild',
            tag: '[tag]',
          });
      })
      .then(() => {
        return models
          .Gw2Character
          .create({
            Gw2ApiTokenToken: 'swag',
            name: 'blastrn',
            gender: 'ay',
            guild: 'guild',
            profession: 'hehe',
            level: 123,
            created: new Date(),
            age: 1,
            race: 'ay',
            deaths: 1,
          });
      })
      .then(() => {
        return controller.read('blastrn', true, 'cool@email');
      })
      .then((data) => {
        expect(data).toEqual({
          authorization: {
            showPublic: true,
            showGuild: true,
          },
          accountName: 'nameyname',
          guild_tag: '[tag]',
          guild_name: 'Guild Name',
          alias: 'madou',
        });

        expect(mockGw2Api.readCharacter).toHaveBeenCalledWith('blastrn', {
          token: 'swag',
          showBags: true,
          showCrafting: true,
          showEquipment: true,
          showBuilds: true,
        });

        done();
      });
  });

  it('should call api with show all', (done) => {
    spyOn(mockGw2Api, 'readCharacter').and.returnValue(Promise.resolve({}));

    models
      .User
      .create({
        email: 'cool@email',
        passwordHash: 'coolpassword',
        alias: 'madou',
      })
      .then(() => {
        return models
          .User
          .findOne({
            where: {
              email: 'cool@email',
            },
          });
      })
      .then((data) => {
        return models
          .Gw2ApiToken
          .create({
            token: 'swag',
            accountName: 'nameyname',
            accountId: 'haah',
            permissions: 'cool,permissions',
            world: 1234,
            UserId: data.id,
          });
      })
      .then(() => {
        return models
          .Gw2Character
          .create({
            Gw2ApiTokenToken: 'swag',
            name: 'blastrn',
            gender: 'ay',
            profession: 'hehe',
            level: 123,
            created: new Date(),
            age: 1,
            race: 'ay',
            deaths: 1,
          });
      })
      .then(() => {
        return controller.read('blastrn', false);
      })
      .then((data) => {
        expect(data).toEqual({
          authorization: {
            showPublic: true,
            showGuild: true,
          },
          accountName: 'nameyname',
          alias: 'madou',
        });

        expect(mockGw2Api.readCharacter).toHaveBeenCalledWith('blastrn', {
          token: 'swag',
          showBags: true,
          showCrafting: true,
          showEquipment: true,
          showBuilds: true,
        });

        done();
      });
  });

  const setupTestData = ({ email, characterName } = {}) => {
    return models
        .User
        .create({
          email: email || 'cool@email',
          passwordHash: 'coolpassword',
          alias: 'madou',
        })
        .then(() => {
          return models
            .User
            .findOne({
              where: {
                email: email || 'cool@email',
              },
            });
        })
        .then((data) => {
          return models
            .Gw2ApiToken
            .create({
              token: 'swag',
              accountName: 'nameyname',
              accountId: 'aaaa',
              permissions: 'cool,permissions',
              world: 1111,
              UserId: data.id,
            });
        })
        .then(() => {
          return models
            .Gw2Character
            .create({
              Gw2ApiTokenToken: 'swag',
              name: characterName || 'blastrn',
              gender: 'ay',
              profession: 'hehe',
              level: 123,
              created: new Date(),
              age: 1,
              guild: 'guild',
              race: 'ay',
              deaths: 1,
            });
        })
        .then(() => {
          return models
            .Gw2Guild
            .create({
              name: 'Guild Name',
              id: 'guild',
              tag: '[tag]',
            });
        })
        .then(() => {
          return models
            .Gw2Character
            .create({
              Gw2ApiTokenToken: 'swag',
              name: 'ayyyyy',
              gender: 'aay',
              profession: 'heehe',
              level: 1,
              created: new Date(),
              age: 1,
              race: 'ayay',
              deaths: 1,
            });
        });
  };

  it('should return all characters by alias', (done) => {
    setupTestData()
      .then(() => {
        controller.list('cool@email')
          .then((list) => {
            const c1 = list[0];
            const c2 = list[1];

            expect(c1.accountName).toBe('nameyname');
            expect(c1.world).toBe(1111);
            expect(c1.name).toBe('blastrn');
            expect(c1.gender).toBe('ay');
            expect(c1.profession).toBe('hehe');
            expect(c1.level).toBe(123);
            expect(c1.race).toBe('ay');

            expect(c2.accountName).toBe('nameyname');
            expect(c2.world).toBe(1111);
            expect(c2.name).toBe('ayyyyy');
            expect(c2.gender).toBe('aay');
            expect(c2.profession).toBe('heehe');
            expect(c2.level).toBe(1);
            expect(c2.race).toBe('ayay');

            done();
          });
      });
  });

  describe('reading random character name', () => {
    it('should return a character name', (done) => {
      const expectedNames = ['blastrn', 'ayyyyy'];

      setupTestData()
        .then(controller.random)
        .then((name) => expect(expectedNames).toContain(name))
        .then(done);
    });
  });

  describe('updating character', () => {
    it('should reject if character doesnt belong to email', (done) => {
      const email = 'email@email.com';
      const characterName = 'Blastrn';

      setupTestData({ email, characterName })
        .then(() => controller.update('bad-email', { name: characterName }))
        .then(null, (e) => expect(e).toEqual('Not your character'))
        .then(done);
    });

    it('should resolve and update if character belongs to email', (done) => {
      const email = 'email@email.com';
      const characterName = 'Blastrn';

      setupTestData({ email, characterName })
        .then(() => controller.update(email, {
          name: characterName,
          showPublic: false,
          showBuilds: false,
          showPvp: false,
          showBags: false,
          showGuild: false,
        }))
        .then(() => {
          return models.Gw2Character.findOne({ where: { name: characterName } });
        })
        .then((character) => {
          expect(character.dataValues).to.include({
            showPublic: false,
            showBuilds: false,
            showPvp: false,
            showBags: false,
            showGuild: false,
          });
        })
        .then(done);
    });
  });
});
