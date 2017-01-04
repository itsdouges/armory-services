// @flow

import type {
  PvpStanding,
  User,
  Guild,
  ApiToken,
  Character,
} from 'flowTypes';

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
  claimed: false,
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

export const character = ({
  name = 'character',
  race = 'race',
  gender = 'Male',
  profession = 'Elementalist',
  level = 20,
  created = '01/02/1990',
  age = 30,
  deaths = 10,
  guild: gld = guild().name,
  Gw2ApiTokenToken = apiToken().token,
  Gw2ApiToken = apiToken(),
}: Character = {}): Character => ({
  name,
  race,
  gender,
  profession,
  level,
  created,
  age,
  deaths,
  guild: gld,
  Gw2ApiTokenToken,
  Gw2ApiToken,
});

const fakeStanding = {
  totalPoints: 26,
  division: 0,
  tier: 1,
  points: 6,
  repeats: 0,
  rating: 1159,
};

export const standing = ({
  current = fakeStanding,
  best = fakeStanding,
  seasonId = 'A54849B7-7DBD-4958-91EF-72E18CD659BA',

}: PvpStanding): PvpStanding => ({
  current,
  best,
  seasonId,
});
