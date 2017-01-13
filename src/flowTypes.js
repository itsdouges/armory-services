// @flow

type Sequelize = {
  upsert: () => Promise<>,
  update: () => Promise<>,
  findOne: () => Promise<>,
  findAll: () => Promise<>,
  create: () => Promise<>,
};

export type Models = {
  PvpStandings: Sequelize,
  Gw2ApiToken: Sequelize,
  User: Sequelize,
  Gw2Character: Sequelize,
  Gw2Guild: Sequelize,
  UserReset: Sequelize,
};

export type FetchOptions = {
  token: string,
};

type Gw2Standing = {
  total_points: number,
  division: number,
  tier: number,
  points: number,
  repeats: number,
  rating?: number,
};

export type Gw2PvpStanding = {
  current: Gw2Standing,
  best: Gw2Standing,
  season_id: string,
};

export type PvpStandingModel = {
  seasonId: string,
  apiToken: string,
  ratingCurrent: number,
  decayCurrent: number,
};

export type PvpSeason = {
  id: string,
};

export type User = {
  id: string,
  email: string,
  passwordHash: string,
  alias: string,
};

export type DbUser = {
  id: number,
};

export type UserModel = {
  id: string,
  alias: string,
  passwordHash: string,
  email: string,

  // ApiKey values
  token?: string,
  accountName?: string,
  guilds?: string,
  dailyAp?: number,
  fractalLevel?: number,
  monthlyAp?: number,
  world?: number,
  wvwRank?: number,
};

export type ApiToken = {
  token: string,
  accountName: string,
  accountId: string,
  permissions: string,
  world: number,
  guilds: string,
  User: User,
  UserId: string,
};

export type Guild = {
  id: string,
  tag: string,
  name: string,
  favor: number,
  resonance: number,
  aetherium: number,
  influence: number,
  level: number,
  motd: string,
  claimed: boolean,
  apiToken?: ?string,
};

export type Character = {
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
};

export type PasswordReset = {
  expires: Date,
  used: boolean,
  UserId: string,
};
