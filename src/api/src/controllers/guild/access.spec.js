import proxyquire from 'proxyquire';

const sandbox = sinon.sandbox.create();
const isAccessAllowed = sandbox.stub();
const isUserInGuild = sandbox.stub();

const { default: canAccess } = proxyquire('./access', {
  '../../services/guild': {
    isAccessAllowed,
  },
  '../../services/user': {
    isUserInGuild,
  },
});

describe('guild user authorization', () => {
  const models = { fake: 'models' };
  const type = 'cool-type';

  context('when guild is not public', () => {
    context('and user is in guild', () => {
      const user = 'user';

      before(() => isUserInGuild.withArgs(models, user).returns(Promise.resolve(true)));

      it('should allow access', () => {
        return canAccess(models, type, user);
      });
    });

    context('and user is not in guild', () => {
      const user = 'user1';

      before(() => isUserInGuild.withArgs(models, user).returns(Promise.resolve(false)));

      it('should not allow access', () => {
        return canAccess(models, type, user).should.be.rejectedWith('Access not allowed');
      });
    });
  });

  context('when guild is public', () => {
    it('should allow access', () => {
      before(() => isAccessAllowed.withArgs(models, type).returns(Promise.resolve(true)));

      it('should allow access', () => {
        return canAccess(models, type, 'random-user');
      });
    });
  });
});
