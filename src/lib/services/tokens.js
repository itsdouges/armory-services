// @flow

import type { Models } from 'flowTypes';
import _ from 'lodash';

import gw2 from 'lib/gw2';

export async function list (models: Models) {
  const tokens = await models.Gw2ApiToken.findAll({
    where: {
      stub: false,
    },
  });

  return tokens.map((item) => item.dataValues);
}

type Tokens$Read = {
  id: number,
};

export async function read (models: Models, { id }: Tokens$Read) {
  return await models.Gw2ApiToken.findOne({
    where: _.pickBy({
      id,
    }),
  });
}

export async function validate (models: Models, apiToken: string) {
  const token = await models.Gw2ApiToken.findOne({ where: { token: apiToken } });
  if (token) {
    throw new Error({
      property: 'apiToken',
      message: 'is already being used',
    });
  }

  const { permissions } = await gw2.readTokenInfo(apiToken);
  const hasCharacters = permissions.filter((item) => {
    return item === 'characters' || item === 'builds';
  });

  if (hasCharacters.length !== 2) {
    throw new Error({
      property: 'apiToken',
      message: 'needs characters and builds permission',
    });
  }

  const { id, name } = await gw2.readAccount(apiToken);
  const existingToken = await models.Gw2ApiToken.findOne({
    where: {
      accountId: id,
    },
  });

  if (existingToken) {
    throw new Error({
      property: 'apiToken',
      message: `key for ${name} already exists`,
    });
  }
}
