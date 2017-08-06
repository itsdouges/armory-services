// @flow

import type { Models } from 'flowTypes';

import gw2Api from 'lib/gw2';
import { fetch } from 'lib/services/fetch';
import {
  claimStubApiToken,
  doesUserHaveTokens,
  getUserId,
  selectPrimaryToken,
  removeToken,
  doesTokenExist,
  listTokens,
} from 'lib/services/user';

import {
  replace as replaceToken,
  create as createToken,
} from 'lib/services/tokens';

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
    const tokenStatus = await doesTokenExist(models, tokenInfo.accountName);

    if (tokenStatus === 'stub') {
      return await claimStubApiToken(models, email, apiToken, setPrimary);
    }

    const tokenData = {
      apiToken,
      userId: id,
      world: tokenInfo.world,
      accountId: tokenInfo.accountId,
      accountName: tokenInfo.accountName,
      makePrimary: setPrimary,
      permissions: tokenInfo.info,
    };

    if (tokenStatus === 'invalid') {
      return await replaceToken(models, tokenData);
    }

    return createToken(models, tokenData);
  }

  async function add (email: string, token: string) {
    await validator.validate({ token });
    const userId = await getUserId(models, email);
    const createdToken = await addTokenToUser(userId, token, email);

    fetch({
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
      valid: true,
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
        // Checking for undefined just for initial migration where
        // valid doesn't exist yet.
        valid: (token.valid === null || token.valid === undefined) ? true : token.valid,
      };
    });
  }

  function remove (email: string, apiToken: string) {
    return removeToken(models, email, apiToken);
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
