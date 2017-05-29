import * as testData from 'test/testData/db';
import { setPrivacy, removePrivacy, hasPrivacy } from './generic';

describe('generic model service', () => {
  const user = testData.user();
  let models;

  const assertPrivacy = async (privacy) => {
    const data = await models.User.findOne({
      where: {
        id: user.id,
      },
    });

    expect(data.privacy).to.include(privacy);
  };

  beforeEach(async () => {
    models = await setupTestDb();
    await models.User.create(user);
  });

  it('should set privacy', async () => {
    await setPrivacy(models.User, 'standings', { key: 'email', value: user.email });
    await assertPrivacy('standings');
  });

  it('should not set privacy if already set', async () => {
    await setPrivacy(models.User, 'standings', { key: 'email', value: user.email });
    await setPrivacy(models.User, 'standings', { key: 'email', value: user.email });

    await assertPrivacy('standings');
  });

  it('should add another privacy', async () => {
    await setPrivacy(models.User, 'standings', { key: 'email', value: user.email });
    await setPrivacy(models.User, 'games', { key: 'email', value: user.email });

    await assertPrivacy('standings|games');
  });

  it('should remove privacy', async () => {
    await setPrivacy(models.User, 'standings', { key: 'email', value: user.email });
    await setPrivacy(models.User, 'games', { key: 'email', value: user.email });
    await removePrivacy(models.User, 'standings', { key: 'email', value: user.email });

    await assertPrivacy('games');
  });

  it('should do nothing if privacy is already removed', async () => {
    await removePrivacy(models.User, 'standings', { key: 'email', value: user.email });

    await assertPrivacy('');
  });

  it('should return true if privacy exists', async () => {
    await setPrivacy(models.User, 'standings', { key: 'email', value: user.email });

    const actual = await hasPrivacy(models.User, 'standings', { key: 'email', value: user.email });

    expect(actual).to.be.true;
  });

  it('should return false if privacy doesnt exists', async () => {
    const actual = await hasPrivacy(models.User, 'standings', { key: 'email', value: user.email });

    expect(actual).to.be.false;
  });
});
