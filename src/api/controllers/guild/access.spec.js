const sandbox = sinon.sandbox.create();
const isAccessAllowed = sandbox.stub();
const isUserInGuild = sandbox.stub();

const canAccess = proxyquire('api/controllers/guild/access', {
  'lib/services/guild': {
    isAccessAllowed,
  },
  'lib/services/user': {
    isUserInGuild,
  },
});

describe('guild user authorization', () => {
  const models = { fake: 'models' };
  const type = 'cool-type';

  context('when guild is not public', () => {
    context('and user is in guild', () => {
      const email = 'user';
      const guildName = 'cool-guild-meng-ye';

      beforeEach(() => isUserInGuild
        .withArgs(models, email, guildName)
        .returns(Promise.resolve(true))
      );

      it('should allow access', async () => {
        const access = await canAccess(models, { type, email, guildName });

        expect(access).to.be.true;
      });
    });

    context('and user is not in guild', () => {
      const email = 'user1';
      const guildName = 'madouuu';

      beforeEach(() => isUserInGuild
        .withArgs(models, email, guildName)
        .returns(Promise.resolve(false))
      );

      it('should not allow access', async () => {
        const allowed = await canAccess(models, { type, email, guildName });

        expect(allowed).to.be.false;
      });
    });
  });

  context('when guild is public', () => {
    const guildName = 'cool-guild-meng';

    beforeEach(() => isAccessAllowed
      .withArgs(models, type, guildName)
      .returns(Promise.resolve(true))
    );

    it('should allow access', async () => {
      const access = await canAccess(models, { type, email: 'random-user', guildName });

      expect(access).to.be.true;
    });
  });
});
