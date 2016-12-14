import axios from 'axios';
import config from '../../../config';

export default function tokenFactory (models, createValidator, gw2Api) {
  createValidator.addResource({
    name: 'gw2-token',
    mode: 'add',
    rules: {
      token: ['valid-gw2-token', 'no-white-space'],
    },
  });

  const validator = createValidator({
    resource: 'gw2-token',
    mode: 'add',
  });

  async function getUserId (email) {
    const user = await models.User.findOne({
      where: {
        email,
      },
    });

    return user.id;
  }

  async function doesUserHaveTokens (userId) {
    const tokens = await models
      .Gw2ApiToken
      .findAll({
        include: [{
          model: models.User,
          where: {
            id: userId,
          },
        }],
      });

    return !!tokens.length;
  }

  async function selectPrimary (email, token) {
    const id = await getUserId(email);

    return await models.Gw2ApiToken.update({
      primary: true,
    }, {
      where: {
        UserId: id,
        token,
      },
    });
  }

  async function addTokenToUser (id, gw2Token) {
    const tokenInfo = await gw2Api.readTokenInfoWithAccount(gw2Token);
    const hasTokens = await doesUserHaveTokens(id);

    const wrappedToken = {
      token: gw2Token,
      UserId: id,
      permissions: tokenInfo.info.join(','),
      world: tokenInfo.world,
      accountId: tokenInfo.accountId,
      accountName: tokenInfo.accountName,
      primary: !hasTokens,
    };

    return await models.Gw2ApiToken.create(wrappedToken);
  }

  async function add (email, token) {
    await validator.validate({ token });

    const user = await models.User.findOne({
      where: {
        email,
      },
    });

    const createdToken = await addTokenToUser(user.id, token);

    const url = `http://${config.fetch.host}:${config.fetch.port}/fetch`;
    console.log(`Posting to ${url}`);
    axios.post(url, {
      token: createdToken.token,
      permissions: createdToken.permissions,
    });

    return {
      token: createdToken.token,
      accountName: createdToken.accountName,
      permissions: createdToken.permissions,
      world: createdToken.world,
      primary: createdToken.primary,
    };
  }

  async function list (email) {
    const tokens = await models
      .Gw2ApiToken
      .findAll({
        include: [{
          model: models.User,
          where: {
            email,
          },
        }],
      });

    return tokens.map((token) => {
      return {
        token: token.token,
        accountName: token.accountName,
        permissions: token.permissions,
        world: token.world,
        primary: token.primary,
      };
    });
  }

  async function remove (email, token) {
    const user = await models
      .User
      .findOne({
        where: {
          email,
        },
      });

    await models.Gw2ApiToken
      .destroy({
        where: {
          UserId: user.id,
          token,
        },
      });
  }

  return {
    list,
    remove,
    selectPrimary,
    add,
    doesUserHaveTokens,
  };
}
