// @flow

import type { Models, PvpStandingModel } from 'flowTypes';
import _ from 'lodash';

export async function saveList (models: Models, pvpStandings: Array<PvpStandingModel>) {
  await Promise.all(pvpStandings.map((standing) => models.PvpStandings.upsert(standing)));
}

export async function list (
  models: Models,
  seasonId: string
): Promise<Array<PvpStandingModel>> {
  const standings = await models.PvpStandings.findAll({
    where: {
      seasonId,
    },
  });

  return standings.map((standing) => _.omit(standing.dataValues, [
    'updatedAt',
    'createdAt',
    'id',
  ]));
}
