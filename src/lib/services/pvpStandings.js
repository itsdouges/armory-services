// @flow

import type { Models, PvpStandingModel, Pagination, PaginatedResponse } from 'flowTypes';
import _ from 'lodash';

export async function saveList (models: Models, pvpStandings: Array<PvpStandingModel>) {
  return await Promise.all(pvpStandings.map((standing) => {
    return models.PvpStandings.findOne({
      where: {
        apiTokenId: standing.apiTokenId,
        seasonId: standing.seasonId,
      },
    }).then((standingInDb) => {
      if (!standingInDb) {
        return models.PvpStandings.create(standing);
      }

      return standingInDb.update(standing);
    });
  }));
}

export async function list (
  models: Models,
  seasonId: string,
  region?: 'gw2a' | 'na' | 'eu',
  params?: Pagination = {},
): Promise<PaginatedResponse<PvpStandingModel>> {
  const rankColumn = `${region || ''}Rank`;

  const withRegionQuery = region && {
    order: [
      [rankColumn, 'ASC'],
    ],
    where: {
      [rankColumn]: {
        $ne: null,
      },
    },
  };

  const { rows, count } = await models.PvpStandings.findAndCount(_.merge({
    where: {
      seasonId,
      apiTokenId: {
        $ne: null,
      },
    },
    include: [{
      model: models.Gw2ApiToken,
      include: [{
        model: models.User,
      }],
    }],
    raw: true,
    ...params,
  }, withRegionQuery));

  return {
    limit: params.limit || count,
    offset: params.offset || 0,
    count,
    rows: rows.map((standing) => ({
      ..._.pick(standing, [
        'euRank',
        'gw2aRank',
        'naRank',
        'ratingCurrent',
        'seasonId',
        'totalPointsBest',
        'decayCurrent',
        'wins',
        'losses',
      ]),
      apiTokenId: standing['Gw2ApiToken.id'],
      alias: standing['Gw2ApiToken.User.alias'],
      accountName: standing['Gw2ApiToken.accountName'],
    })),
  };
}
