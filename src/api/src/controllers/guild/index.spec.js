import proxyquire from 'proxyquire';
import _ from 'lodash';

import * as testData from '../../../test/testData';

const config = {
  cache: {
    findAllCharacters: 12,
  },
};

const readGuild = sinon.stub();
const listGuilds = sinon.stub();
const listCharacters = sinon.stub();
const listUsers = sinon.stub();
const canAccess = sinon.stub();

const { default: controller } = proxyquire('./index', {
  '../../../config': config,
  '../../services/guild': {
    read: readGuild,
    list: listGuilds,
  },
  '../../services/character': {
    list: listCharacters,
  },
  '../../services/user': {
    list: listUsers,
  },
  './access': canAccess,
});

describe('guild controller', () => {
  const models = { stub: 'models' };

  let sut;

  const guildData = testData.guild();

  const guilds = [
    testData.guild(),
    testData.guild(),
    testData.guild(),
    testData.guild(),
  ];

  const characters = [
    testData.character(),
    testData.character(),
  ];
  const users = [
    testData.user(),
    testData.user(),
  ];

  before(() => {
    readGuild
      .withArgs(models, { name: 'name' })
      .returns(Promise.resolve(guildData));

    listCharacters
      .withArgs(models, { guild: guildData.id })
      .returns(Promise.resolve(characters));

    listUsers
      .withArgs(models, { guild: guildData.id })
      .returns(Promise.resolve(users));

    listGuilds
      .withArgs(models)
      .returns(Promise.resolve(guilds));

    sut = controller(models);
  });

  describe('reading guild', () => {
    context('when user does not have access', () => {
      it('should output subset of data', () => {
        const requestingUser = 'blastrn';

        canAccess
          .withArgs(models, 'read', requestingUser)
          .returns(Promise.resolve(false));

        return sut.read('name', { requestingUser })
          .then((guild) => {
            expect(guild).to.eql({
              ..._.pick(guildData, [
                'name',
                'id',
                'tag',
              ]),
              characters,
              users,
            });
          });
      });
    });

    context('when user does have access', () => {
      it('should output all data', () => {
        const requestingUser = 'madou';

        canAccess
          .withArgs(models, 'read', requestingUser)
          .returns(Promise.resolve(true));

        return sut.read('name', { requestingUser })
          .then((guild) => {
            expect(guild).to.eql({
              ...guildData,
              characters,
              users,
            });
          });
      });
    });
  });

  it('should select random guild', () => {
    return sut.random(2)
      .then((guild) => expect(guild.length).to.equal(2));
  });
});
