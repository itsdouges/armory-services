// @flow

import type { Models, User, UserModel, DbUser } from 'flowTypes';
import _ from 'lodash';
import moment from 'moment';
import uuid from 'uuid/v4';

import config from 'config';
import gw2, { readLatestPvpSeason } from 'lib/gw2';
import fetchToken from 'fetch/fetchers/account';
import { read as readGuild } from './guild';

type ListOptions = {
  guild: string,
};

export async function list (models: Models, { guild }: ListOptions): Promise<Array<UserModel>> {
  const tokens = await models.Gw2ApiToken.findAll({
    where: {
      guilds: {
        $like: `%${guild}%`,
      },
    },
    include: [{
      model: models.User,
    }],
  });

  return tokens.map((token) => ({
    name: token.User.alias,
    accountName: token.accountName,
  }));
}

export async function isUserInGuild (
  models: Models,
  email: string,
  guildName: string,
): Promise<boolean> {
  const { id } = await readGuild(models, { name: guildName });

  const token = await models.Gw2ApiToken.findAll({
    where: {
      guilds: {
        $like: `%${id}%`,
      },
    },
    include: [{
      model: models.User,
      where: {
        email,
      },
    }],
  });

  return !!token.length;
}

function cleanApiToken (apiToken) {
  if (!apiToken) {
    return undefined;
  }

  return {
    tokenId: apiToken.id,
    token: apiToken.token,
    accountName: apiToken.accountName,
    world: apiToken.world,
    access: apiToken.access,
    commander: apiToken.commander,
    fractalLevel: apiToken.fractalLevel,
    dailyAp: apiToken.dailyAp,
    monthlyAp: apiToken.monthlyAp,
    wvwRank: apiToken.wvwRank,
    guilds: apiToken.guilds,
  };
}

type CreateUser = User & {
  passwordHash: string,
};

export async function create (models: Models, user: CreateUser): Promise<DbUser> {
  return await models.User.create(user);
}

async function readByToken (models, { accountName, apiToken }): Promise<?UserModel> {
  const token = await models.Gw2ApiToken.findOne({
    where: _.pickBy({
      token: apiToken,
      accountName,
    }),
    include: [{
      model: models.User,
    }],
  });

  return token ? {
    ...cleanApiToken(token),
    id: token.User.id,
    alias: token.User.alias,
    passwordHash: token.User.passwordHash,
    email: token.User.email,
    stub: token.User.stub,
  } : null;
}

async function readByUser (models, { alias, email }) {
  const user = await models.User.findOne({
    where: _.pickBy({ alias, email }),
    include: {
      all: true,
    },
  });

  return user ? {
    ...cleanApiToken(_.find(user.gw2_api_tokens, ({ primary }) => primary)),
    id: user.id,
    alias: user.alias,
    passwordHash: user.passwordHash,
    email: user.email,
    stub: user.stub,
  } : null;
}

type ReadOptions = {
  apiToken?: string,
  alias?: string,
  email?: string,
  accountName?: string,
};

export async function read (models: Models, {
  apiToken,
  alias,
  email,
  accountName,
}: ReadOptions): Promise<?UserModel> {
  const data = (apiToken || accountName)
    ? await readByToken(models, { apiToken, accountName })
    : await readByUser(models, { alias, email });

  if (!data) {
    return null;
  }

  const { id: seasonId } = await readLatestPvpSeason();
  const standing = await models.PvpStandings.findOne({
    where: {
      seasonId,
      apiTokenId: data.tokenId,
    },
  });

  return {
    ...data,
    euRank: standing && standing.euRank,
    naRank: standing && standing.naRank,
    gw2aRank: standing && standing.gw2aRank,
    rating: standing && standing.ratingCurrent,
  };
}

type UpdateUser = {
  id: string,
  passwordHash: string,
};

export async function update (models: Models, user: UpdateUser): Promise<> {
  await models.User.update({
    passwordHash: user.passwordHash,
  }, {
    where: {
      id: user.id,
    },
  });
}

export async function createPasswordReset (models: Models, userId: string): Promise<string> {
  const { id } = await models.UserReset.create({
    UserId: userId,
    expires: moment().add(config.forgotMyPassword.expiry, 'minutes'),
  });

  return id;
}

export async function readPasswordReset (models: Models, resetId: string): Promise<> {
  return await models.UserReset.findOne({
    where: {
      id: resetId,
    },
  });
}

export async function finishPasswordReset (models: Models, resetId: string): Promise<> {
  return await models.UserReset.update({ used: true }, {
    where: {
      id: resetId,
    },
  });
}

export async function createStubUser (models: Models, accountName: string): Promise<> {
  const stubUserValue = 'stubuser';

  const user = {
    alias: accountName,
    passwordHash: stubUserValue,
    email: stubUserValue,
    stub: true,
  };

  const { id } = await models.User.create(user);
  const { id: tokenId } = await models.Gw2ApiToken.create({
    permissions: '',
    world: -1,
    accountId: uuid(),
    UserId: id,
    accountName,
    primary: true,
    token: uuid(),
    stub: true,
  });

  return {
    id,
    apiTokenId: tokenId,
  };
}

export async function claimStubApiToken (models: Models, email: string, apiToken: string) {
  const { name } = await gw2.readAccount(apiToken);

  const user = await read(models, { email });
  if (!user) {
    throw new Error('User doesnt exist');
  }

  await models.Gw2ApiToken.update({
    token: apiToken,
    stub: false,
    UserId: user.id,
  }, {
    where: {
      accountName: name,
    },
  });

  await models.User.destroy({
    where: {
      alias: name,
      stub: true,
    },
  });

  const { id } = await models.Gw2ApiToken.findOne({
    where: {
      token: apiToken,
    },
  });

  await fetchToken(models, { token: apiToken, permissions: 'guilds', id });
}

type ClaimUser = CreateUser & {
  apiToken: string,
};

export async function claimStubUser (models: Models, user: ClaimUser) {
  const { name } = await gw2.readAccount(user.apiToken);

  await models.User.update({
    ...user,
    stub: false,
  }, {
    where: {
      alias: name,
    },
  });

  await models.Gw2ApiToken.update({
    token: user.apiToken,
    stub: false,
  }, {
    where: {
      accountName: name,
    },
  });

  const { id } = await models.Gw2ApiToken.findOne({
    where: {
      token: user.apiToken,
    },
  });

  await fetchToken(models, { token: user.apiToken, permissions: 'guilds', id });
}
