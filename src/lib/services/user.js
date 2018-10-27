// @flow

import type { Models, User, UserModel, DbUser, PaginatedResponse } from 'flowTypes';
import _ from 'lodash';
import moment from 'moment';
import uuid from 'uuid/v4';
import { allSettled } from 'lib/promise';
import throat from 'throat';
import axios from 'axios';

import config from 'config';
import gw2, { readLatestPvpSeason } from 'lib/gw2';
import { read as readGuild } from './guild';
import {
  setPrivacy as setPrivacyGeneric,
  removePrivacy as removePrivacyGeneric,
  hasPrivacy as hasPrivacyGeneric,
} from './generic';

type ListOptions = {
  guild?: string,
  limit?: number,
  offset?: number,
};

export async function list(
  models: Models,
  { guild, limit, offset }: ListOptions
): Promise<PaginatedResponse<UserModel>> {
  const { rows, count } = await models.Gw2ApiToken.findAndCount({
    limit,
    offset,
    where: {
      guilds: {
        $like: `%${guild || ''}%`,
      },
    },
    order: [['stub', 'ASC']],
    include: [
      {
        model: models.User,
      },
    ],
  });

  return {
    rows: rows.map(token => ({
      name: token.User.alias,
      accountName: token.accountName,
    })),
    count,
    limit: limit || count,
    offset: offset || 0,
  };
}

export async function isUserInGuild(
  models: Models,
  email: string,
  guildName: string
): Promise<boolean> {
  const guild = await readGuild(models, { name: guildName });

  const token = await models.Gw2ApiToken.findAll({
    where: {
      guilds: {
        $like: `%${guild ? guild.id : ''}%`,
      },
    },
    include: [
      {
        model: models.User,
        where: {
          email,
        },
      },
    ],
  });

  return !!token && !!token.length;
}

function cleanApiToken(apiToken) {
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
    valid: apiToken.valid,
  };
}

type CreateUser = User & {
  passwordHash: string,
};

export async function create(models: Models, user: CreateUser): Promise<DbUser> {
  return await models.User.create(user);
}

async function readByToken(models, { accountName, apiToken, apiTokenId }): Promise<?UserModel> {
  const token = await models.Gw2ApiToken.findOne({
    where: _.pickBy({
      id: apiTokenId,
      token: apiToken,
      accountName,
    }),
    include: [
      {
        model: models.User,
      },
    ],
  });

  return token
    ? {
        ...cleanApiToken(token),
        id: token.User.id,
        alias: token.User.alias,
        passwordHash: token.User.passwordHash,
        email: token.User.email,
        stub: token.User.stub,
        privacy: (token.User.privacy || '').split('|').filter(Boolean),
      }
    : null;
}

async function readByUser(models, { alias, email }) {
  const user = await models.User.findOne({
    // We only want to use one prop to find the user.
    where: _.pickBy({ alias, email: alias && email ? undefined : email }),
    include: {
      all: true,
    },
  });

  return user
    ? {
        ...cleanApiToken(_.find(user.gw2_api_tokens, ({ primary }) => primary)),
        id: user.id,
        alias: user.alias,
        passwordHash: user.passwordHash,
        email: user.email,
        stub: user.stub,
        privacy: (user.privacy || '').split('|').filter(Boolean),
      }
    : null;
}

type ReadOptions = {
  apiToken?: string,
  apiTokenId?: number,
  alias?: string,
  email?: string,
  accountName?: string,
  mode?: 'lean' | 'full',
};

export async function read(
  models: Models,
  { apiTokenId, apiToken, alias, email, accountName, mode }: ReadOptions
): Promise<?UserModel> {
  const data =
    apiTokenId || accountName || apiToken
      ? await readByToken(models, { apiTokenId, apiToken, accountName })
      : await readByUser(models, { alias, email });

  if (!data) {
    return null;
  }

  if (mode === 'lean') {
    return data;
  }

  const { id: seasonId } = await readLatestPvpSeason('en');
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
    wins: standing && standing.wins,
    losses: standing && standing.losses,
  };
}

type UpdateUser = {
  id: string,
  passwordHash: string,
};

export async function update(models: Models, user: UpdateUser): Promise<> {
  await models.User.update(
    {
      passwordHash: user.passwordHash,
    },
    {
      where: {
        id: user.id,
      },
    }
  );
}

export async function createPasswordReset(models: Models, userId: string): Promise<string> {
  const { id } = await models.UserReset.create({
    UserId: userId,
    expires: moment().add(config.forgotMyPassword.expiry, 'minutes'),
  });

  return id;
}

export async function readPasswordReset(models: Models, resetId: string): Promise<> {
  return await models.UserReset.findOne({
    where: {
      id: resetId,
    },
  });
}

export async function finishPasswordReset(models: Models, resetId: string): Promise<> {
  return await models.UserReset.update(
    { used: true },
    {
      where: {
        id: resetId,
      },
    }
  );
}

type StubUser = {
  guilds?: Array<string>,
  accountName: string,
};

type StubUserWithId = StubUser & {
  id?: number,
};

async function updateStubUser(models: Models, { guilds, id: userId }: StubUserWithId) {
  if (!guilds) {
    return null;
  }

  const apiToken = await models.Gw2ApiToken.findOne({
    include: [
      {
        model: models.User,
        where: {
          id: userId,
        },
      },
    ],
  });

  const mappedGuilds = apiToken.guilds ? guilds.concat(apiToken.guilds.split(',')) : guilds;
  await apiToken.set('guilds', _.uniq(mappedGuilds).join(','));
  await apiToken.save();

  return {
    id: userId,
    apiTokenId: apiToken.id,
  };
}

async function createStubUser(
  models: Models,
  { accountName, guilds, id: userId }: StubUserWithId
): Promise<> {
  const stubUserValue = 'stubuser';

  if (userId) {
    return updateStubUser(models, { accountName, guilds, id: userId });
  }

  const { id } = await models.User.create({
    alias: accountName,
    passwordHash: stubUserValue,
    email: `${accountName}@stub.com`,
    stub: true,
  });
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

export async function bulkCreateStubUser(models: Models, users: Array<StubUser>) {
  const foundUsers = [];
  for (let i = 0; i < users.length; i++) {
    const { accountName } = users[i];
    const user = await read(models, { accountName, mode: 'lean' });
    foundUsers.push(user);
  }

  const newUsers = _.zip(foundUsers, users)
    .filter(([user]) => !user || user.stub)
    .map(([userInDb, user]) => ({
      ..._.pick(userInDb, ['id']),
      ...user,
    }));

  if (newUsers.length) {
    return await allSettled(
      newUsers.map(throat(config.fetch.concurrentCalls, user => createStubUser(models, user)))
    );
  }

  return [];
}

async function readToken(apiToken) {
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

export async function claimStubApiToken(
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

  await models.Gw2ApiToken.update(
    {
      token: apiToken,
      permissions,
      accountId,
      stub: false,
      UserId: user.id,
      primary,
    },
    {
      where: {
        accountName: name,
      },
    }
  );

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

export async function claimStubUser(models: Models, user: ClaimUser) {
  const { name, permissions, accountId } = await readToken(user.apiToken);

  await models.User.update(
    {
      ...user,
      stub: false,
    },
    {
      where: {
        alias: name,
      },
    }
  );

  await models.Gw2ApiToken.update(
    {
      token: user.apiToken,
      stub: false,
      permissions,
      accountId,
    },
    {
      where: {
        accountName: name,
      },
    }
  );

  const { id } = await models.Gw2ApiToken.findOne({
    where: {
      token: user.apiToken,
    },
  });

  axios.post(`http://${config.fetch.host}:${config.fetch.port}/fetch`, {
    token: user.apiToken,
    permissions,
    id,
  });
}

export async function getUserId(models: Models, email: string) {
  const user = await models.User.findOne({
    where: {
      email,
    },
  });

  return user.id;
}

export async function doesUserHaveTokens(models: Models, userId: number) {
  const tokens = await models.Gw2ApiToken.findAll({
    include: [
      {
        model: models.User,
        where: {
          id: userId,
        },
      },
    ],
  });

  return !!tokens.length;
}

type Token$Status = 'valid' | 'invalid' | 'stub' | false;
export async function doesTokenExist(models: Models, accountName: string): Promise<Token$Status> {
  const token = await models.Gw2ApiToken.findOne({
    where: {
      accountName,
    },
  });

  if (token) {
    if (token.stub) {
      return 'stub';
    }

    if (token.valid) {
      return 'valid';
    }

    return 'invalid';
  }

  return false;
}

export async function selectPrimaryToken(models: Models, email: string, token: string) {
  const id = await getUserId(models, email);

  await models.Gw2ApiToken.update(
    {
      primary: false,
    },
    {
      where: {
        UserId: id,
      },
    }
  );

  await models.Gw2ApiToken.update(
    {
      primary: true,
    },
    {
      where: {
        UserId: id,
        token,
      },
    }
  );
}

export function listTokens(models: Models, email: string) {
  return models.Gw2ApiToken.findAll({
    include: [
      {
        model: models.User,
        where: {
          email,
        },
      },
    ],
  });
}

export async function removeToken(models: Models, email: string, apiToken: string) {
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

export async function setPrivacy(models: Models, email: string, privacy: string) {
  return setPrivacyGeneric(models.User, privacy, {
    key: 'email',
    value: email,
  });
}

export async function removePrivacy(models: Models, email: string, privacy: string) {
  return removePrivacyGeneric(models.User, privacy, {
    key: 'email',
    value: email,
  });
}

export async function hasPrivacy(models: Models, email: string, privacy: string) {
  return hasPrivacyGeneric(models.User, privacy, {
    key: 'email',
    value: email,
  });
}
