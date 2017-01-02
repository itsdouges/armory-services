// @flow

import { read as readGuild } from './guild';

type ListOptions = {
  guild: string,
};

type User = {
  name: string,
  accountName: string,
  id: number,
};

export async function list (models: any, { guild }: ListOptions): Promise<Array<User>> {
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
  models: any,
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

export function parseUser (user: User) {
  if (!user) {
    return Promise.reject('User not found');
  }

  return user.id;
}

export function getUserByEmail (models: any, email: string) {
  return models.User.findOne({
    where: {
      email,
    },
  });
}

export function getUserIdByEmail (models: any, email: string) {
  return getUserByEmail(models, email).then(parseUser);
}

export function getUserIdByAlias (models: any, alias: string) {
  return models.User.findOne({
    where: {
      alias,
    },
  })
  .then(parseUser);
}

export async function getUserPrimaryToken (models: any, alias: string) {
  const id = await getUserIdByAlias(models, alias);
  const token = await models
  .Gw2ApiToken
  .findOne({
    where: {
      primary: true,
    },
    include: [{
      model: models.User,
      where: {
        id,
      },
    }],
  });

  if (!token) {
    return Promise.reject('Token not found');
  }

  return token.token;
}
