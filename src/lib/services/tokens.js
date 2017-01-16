// @flow

import type { Models } from 'flowTypes';

export async function list (models: Models) {
  const tokens = await models.Gw2ApiToken.findAll({
    where: {
      stub: false,
    },
  });

  return tokens.map((item) => ({
    token: item.dataValues.token,
    permissions: item.dataValues.permissions,
  }));
}

export async function validate (models: Models, apiToken: string) {

}
