// @flow

import type { Models, User, UserModel, DbUser } from 'flowTypes';
import _ from 'lodash';
import moment from 'moment';
import uuid from 'uuid/v4';
import { allSettled } from 'lib/promise';
import throat from 'throat';

import config from 'config';
import gw2, { readLatestPvpSeason } from 'lib/gw2';
import fetchToken from 'fetch/fetchers/account';
import { read as readGuild } from './guild';

type ListOptions = {
  guild?: string,
};

export async function list (models: Models, { guild }: ListOptions): Promise<Array<UserModel>> {
  const tokens = await models.Gw2ApiToken.findAll({
    where: {
      guilds: {
        $like: `%${guild || ''}%`,
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
  const guild = await readGuild(models, { name: guildName });

  const token = await models.Gw2ApiToken.findAll({
    where: {
      guilds: {
        $like: `%${guild ? guild.id : ''}%`,
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

async function readByToken (models, { accountName, apiToken, apiTokenId }): Promise<?UserModel> {
  const token = await models.Gw2ApiToken.findOne({
    where: _.pickBy({
      id: apiTokenId,
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
  apiTokenId?: number,
  alias?: string,
  email?: string,
  accountName?: string,
  mode?: 'lean' | 'full',
};

export async function read (models: Models, {
  apiTokenId,
  apiToken,
  alias,
  email,
  accountName,
  mode,
}: ReadOptions): Promise<?UserModel> {
  const data = (apiTokenId || accountName || apiToken)
    ? await readByToken(models, { apiTokenId, apiToken, accountName })
    : await readByUser(models, { alias, email });

  if (!data) {
    return null;
  }

  if (mode === 'lean') {
    return data;
  }

  const { id: seasonId } = await readLatestPvpSeason();
  const standing = await models.PvpStandings.findOne({
    where: {
      seasonId,
      apiTokenId: data.tokenId,
    },
    order: [['createdAt', 'DESC']],
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

type StubUser = {
  guilds?: Array<string>,
  accountName: string,
};

type StubUserWithId = StubUser & {
  id?: number,
};

async function updateStubUser (models: Models, { guilds, id: userId }: StubUserWithId) {
  if (!guilds) {
    return null;
  }

  const apiToken = await models.Gw2ApiToken.findOne({
    include: [{
      model: models.User,
      where: {
        id: userId,
      },
    }],
  });

  const mappedGuilds = guilds.concat(apiToken.guilds.split(','));

  await apiToken.update({
    guilds: _.uniq(mappedGuilds).join(','),
  });

  return {
    id: userId,
    apiTokenId: apiToken.id,
  };
}

async function createStubUser (
  models: Models,
  { accountName, guilds, id: userId }: StubUserWithId
): Promise<> {
  const stubUserValue = 'stubuser';

  const data = {
    alias: accountName,
    passwordHash: stubUserValue,
    email: stubUserValue,
    stub: true,
  };

  if (userId) {
    return updateStubUser(models, { accountName, guilds, id: userId });
  }

  const { id } = await models.User.create(data);
  const { id: tokenId } = await models.Gw2ApiToken.create({
    permissions: '',
    world: -1,
    accountId: uuid(),
    UserId: id,
    accountName,
    primary: true,
    token: uuid(),
    stub: true,
    guilds: guilds && guilds.join(','),
  });

  return {
    id,
    apiTokenId: tokenId,
  };
}

export async function bulkCreateStubUser (models: Models, users: Array<StubUser>) {
  const foundUsers = await Promise.all(
    users.map(({ accountName }) => read(models, { accountName, mode: 'lean' }))
  );

  const newUsers = _.zip(foundUsers, users)
    .filter(([user]) => (!user || user.stub))
    .map(([userInDb, user]) => ({
      ..._.pick(userInDb, ['id']),
      ...user,
    }));

  if (newUsers.length) {
    return await allSettled(
      newUsers.map(
        throat(config.fetch.concurrentCalls, (user) => createStubUser(models, user))
      )
    );
  }

  return [];
}

async function readToken (apiToken) {
  const [account, info] = await Promise.all([
    gw2.readAccount(apiToken),
    gw2.readTokenInfo(apiToken),
  ]);

  return {
    name: account.name,
    permissions: info.permissions.join(','),
    accountId: info.id,
  };
}

export async function claimStubApiToken (
  models: Models,
  email: string,
  apiToken: string,
  primary: boolean = false
) {
  const { name, permissions, accountId } = await readToken(apiToken);

  const user = await read(models, { email });
  if (!user) {
    throw new Error('User doesnt exist');
  }

  await models.Gw2ApiToken.update({
    token: apiToken,
    permissions,
    accountId,
    stub: false,
    UserId: user.id,
    primary,
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

  return {
    token: apiToken,
    id,
    accountName: name,
    permissions,
    primary,
  };
}

type ClaimUser = CreateUser & {
  apiToken: string,
};

export async function claimStubUser (models: Models, user: ClaimUser) {
  const { name, permissions, accountId } = await readToken(user.apiToken);

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
    permissions,
    accountId,
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

  fetchToken(models, { token: user.apiToken, permissions, id });
}

export async function getUserId (models: Models, email: string) {
  const user = await models.User.findOne({
    where: {
      email,
    },
  });

  return user.id;
}

export async function doesUserHaveTokens (models: Models, userId: number) {
  const tokens = await models.Gw2ApiToken.findAll({
    include: [{
      model: models.User,
      where: {
        id: userId,
      },
    }],
  });

  return !!tokens.length;
}

export async function doesTokenExist (models: Models, accountName: string) {
  const tokenExists = await models.Gw2ApiToken.findOne({
    where: {
      accountName,
    },
  });

  return !!tokenExists;
}

export async function selectPrimaryToken (models: Models, email: string, token: string) {
  const id = await getUserId(models, email);

  await models.Gw2ApiToken.update({
    primary: false,
  }, {
    where: {
      UserId: id,
    },
  });

  await models.Gw2ApiToken.update({
    primary: true,
  }, {
    where: {
      UserId: id,
      token,
    },
  });
}

export async function listTokens (models: Models, email: string) {
  return await models.Gw2ApiToken.findAll({
    include: [{
      model: models.User,
      where: {
        email,
      },
    }],
  });
}

export async function removeToken (models: Models, email: string, apiToken: string) {
  const user = await models.User.findOne({
    where: {
      email,
    },
  });

  await models.Gw2ApiToken.destroy({
    where: {
      UserId: user.id,
      token: apiToken,
    },
  });
}
