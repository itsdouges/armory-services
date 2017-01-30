// @flow

import type { Models } from 'flowTypes';

import axios from 'axios';
import config from 'config';
import gw2Api from 'lib/gw2';
import {
  claimStubApiToken,
  doesUserHaveTokens,
  getUserId,
  selectPrimaryToken,
  removeToken,
  doesTokenExist,
  listTokens,
} from 'lib/services/user';

export default function tokenFactory (models: Models, createValidator: any) {
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

  async function addTokenToUser (id, apiToken, email) {
    const [tokenInfo, hasTokens] = await Promise.all([
      gw2Api.readTokenInfoWithAccount(apiToken),
      await doesUserHaveTokens(models, id),
    ]);

    const setPrimary = !hasTokens;
    const tokenExists = await doesTokenExist(models, tokenInfo.accountName);

    if (tokenExists) {
      // Stub token is being replaced
      return await claimStubApiToken(models, email, apiToken, setPrimary);
    }

    return await models.Gw2ApiToken.create({
      token: apiToken,
      UserId: id,
      permissions: tokenInfo.info.join(','),
      world: tokenInfo.world,
      accountId: tokenInfo.accountId,
      accountName: tokenInfo.accountName,
      primary: setPrimary,
    });
  }

  async function add (email: string, token: string) {
    await validator.validate({ token });
    const userId = await getUserId(models, email);
    const createdToken = await addTokenToUser(userId, token, email);

    axios.post(`http://${config.fetch.host}:${config.fetch.port}/fetch`, {
      token: createdToken.token,
      permissions: createdToken.permissions,
      id: createdToken.id,
    });

    return {
      token: createdToken.token,
      id: createdToken.id,
      accountName: createdToken.accountName,
      permissions: createdToken.permissions,
      primary: createdToken.primary,
    };
  }

  async function list (email: string) {
    const tokens = await listTokens(models, email);

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

  async function remove (email: string, apiToken: string) {
    await removeToken(models, email, apiToken);
  }

  async function selectPrimary (email: string, apiToken: string) {
    await selectPrimaryToken(models, email, apiToken);
  }

  return {
    list,
    remove,
    selectPrimary,
    add,
  };
}
