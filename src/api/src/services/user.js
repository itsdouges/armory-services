// @flow

import { read as readGuild } from './guild';

type ListOptions = {
  guild: string,
};

type User = {
  name: string,
  accountName: string,
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
