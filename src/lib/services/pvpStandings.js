// @flow

import type { Models, PvpStandingModel, Pagination, PaginatedResponse } from 'flowTypes';
import _ from 'lodash';
import sequelize from 'sequelize';

export async function saveList(models: Models, pvpStandings: Array<PvpStandingModel>) {
  for (let i = 0; i < pvpStandings.length; i++) {
    const standing = pvpStandings[i];
    // Always create a new standing so we have historical data to show.
    await models.PvpStandings.create(standing);
  }
}

export async function list(
  models: Models,
  seasonId: string,
  region?: 'gw2a' | 'na' | 'eu',
  params?: Pagination = {}
): Promise<PaginatedResponse<PvpStandingModel>> {
  const rankColumn = `${region || ''}Rank`;

  const withRegionQuery = region && {
    order: [[rankColumn, 'ASC']],
    where: {
      [rankColumn]: {
        $ne: null,
      },
    },
  };

  const { rows, count } = await models.PvpStandings.findAndCount(
    _.merge(
      {
        attributes: [
          sequelize.fn('max', sequelize.col('PvpStandings.id')),
          'apiTokenId',
          'euRank',
          'gw2aRank',
          'naRank',
          'ratingCurrent',
          'seasonId',
          'totalPointsBest',
          'decayCurrent',
          'wins',
          'losses',
        ],
        where: {
          seasonId,
          apiTokenId: {
            $ne: null,
          },
        },
        group: [
          'apiTokenId',
          'euRank',
          'gw2aRank',
          'naRank',
          'ratingCurrent',
          'seasonId',
          'totalPointsBest',
          'decayCurrent',
          'wins',
          'losses',
        ],
        include: [
          {
            model: models.Gw2ApiToken,
            include: [
              {
                model: models.User,
              },
            ],
          },
        ],
        raw: true,
        ...params,
      },
      withRegionQuery
    )
  );

  return {
    limit: params.limit || count.length,
    offset: params.offset || 0,
    count: count.length,
    rows: rows.map(standing => ({
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
