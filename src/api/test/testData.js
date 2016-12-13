// @flow

interface User {
  id: string,
  email: string,
  passwordHash: string,
  alias: string,
}

interface ApiToken {
  token: string,
  accountName: string,
  accountId: string,
  permissions: string,
  world: number,
  guilds: string,
  User: User,
  UserId: string,
}

interface Guild {
  id: string,
  tag: string,
  name: string,
  favor: number,
  resonance: number,
  aetherium: number,
  influence: number,
  level: number,
  motd: string,
  apiToken?: ?string,
}

interface Character {
  name: string,
  race: string,
  gender: 'Female' | 'Male',
  profession: string,
  level: number,
  created: string,
  age: number,
  deaths: number,
  guild: string,
  Gw2ApiTokenToken: string,
  Gw2ApiToken: ApiToken,
}

const defaultUser: User = {
  id: '938C506D-F838-F447-8B43-4EBF34706E0445B2B503',
  email: 'cool@email.com',
  passwordHash: 'realhashseriously',
  alias: 'huedwell',
};

export const user = (usr: ?User): User => ({
  ...defaultUser,
  ...usr,
});

const defaultGuild: Guild = {
  id: 'im-guild',
  tag: 'tag',
  name: 'name',
  apiToken: undefined,
  favor: 123,
  resonance: 333,
  aetherium: 444,
  influence: 555,
  level: 60,
  motd: 'Cool message of the day',
};

export const guild = (gld: ?Guild): Guild => ({
  ...defaultGuild,
  ...gld,
});

const defaultApiToken = {
  token: '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15',
  accountName: 'cool.4321',
  accountId: 'haha_id',
  permissions: 'cool,permissions',
  world: 1234,
  guilds: guild().id,
  User: user(),
  UserId: user().id,
};

export const apiToken = (apiTkn: ?ApiToken): ApiToken => ({
  ...defaultApiToken,
  ...apiTkn,
});

const defaultCharacter: Character = {
  name: 'character',
  race: 'race',
  gender: 'Male',
  profession: 'Elementalist',
  level: 20,
  created: '01/02/1990',
  age: 30,
  deaths: 10,
  guild: guild().name,
  Gw2ApiTokenToken: apiToken().token,
  Gw2ApiToken: apiToken(),
};

export const character = (char: ?Character): Character => ({
  ...defaultCharacter,
  ...char,
});
