// @flow

import type { Models, PvpStandingModel } from 'flowTypes';
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
  offset?: number = 0,
  limit?: number = 250,
): Promise<Array<PvpStandingModel>> {
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

  const standingsLatest = await models.PvpStandings.findAll(_.merge({
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
    offset,
    limit,
    raw: true,
  }, withRegionQuery));

  return standingsLatest.map((standing) => ({
    ..._.pick(standing, [
      'euRank',
      'gw2aRank',
      'naRank',
      'ratingCurrent',
      'seasonId',
    ]),
    alias: standing['Gw2ApiToken.User.alias'],
    accountName: standing['Gw2ApiToken.accountName'],
  }));
}
