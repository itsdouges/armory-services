// @flow

import type { Models, PvpStandingModel } from 'flowTypes';
import _ from 'lodash';

export async function saveList (models: Models, pvpStandings: Array<PvpStandingModel>) {
  await Promise.all(pvpStandings.map((standing) => {
    return models.PvpStandings.findOne({
      where: {
        apiTokenId: standing.apiTokenId,
        seasonId: standing.seasonId,
      },
    }).then((standingInDb) => {
      const id = standingInDb && standingInDb.id;
      if (!id) {
        return models.PvpStandings.create(standing);
      }

      return models.PvpStandings.update(standing, {
        where: {
          id,
        },
      });
    });
  }));
}

export async function list (
  models: Models,
  seasonId: string,
  region?: 'gw2a' | 'na' | 'eu',
): Promise<Array<PvpStandingModel>> {
  const query = {
    where: {
      seasonId,
      ...region && {
        [`${region}Rank`]: {
          $ne: null,
        },
      },
    },
    raw: true,
  };

  const standingsLatest = await models.PvpStandings.findAll(query);

  return standingsLatest.map((standing) => _.omit(standing, [
    'updatedAt',
    'createdAt',
    'id',
  ]));
}
