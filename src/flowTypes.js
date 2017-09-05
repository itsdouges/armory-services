// @flow

type Query = {
  where?: { [string]: any },
};

type Data = {
  [string]: any,
};

export type Sequelize = {
  upsert: (Data) => Promise<>,
  update: (Data, Query) => Promise<>,
  findOne: (?Query) => Promise<>,
  findAll: (?Query) => Promise<>,
  create: (Data) => Promise<>,
  destroy: (Query) => Promise<>,
  findAndCount: (Query) => Promise<>,
  count: (?Query) => Promise<number>,
};

export type Models = {
  PvpStandings: Sequelize,
  Gw2ApiToken: Sequelize,
  User: Sequelize,
  Gw2Character: Sequelize,
  Gw2Guild: Sequelize,
  UserReset: Sequelize,
  PvpStandingsHistory: Sequelize,
  sequelize: any,
};

export type Pagination = {
  limit?: number,
  offset?: number,
};

export type Params = Pagination & {
  lang?: string,
};

export type PaginatedResponse<T> = {
  rows: Array<T>,
  count: number,
  limit: number,
  offset: number,
}

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
  apiTokenId: number,
  ratingCurrent: number,
  decayCurrent: number,
};

export type PvpSeason = {
  id: string,
  name: string,
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
  privacy: ?string,

  // ApiKey values
  tokenId: number,
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
  id: number,
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

export type CharacterSimple = {
  accountName: string,
  userAlias: string,
  name: string,
  race: string,
  gender: 'Female' | 'Male',
  profession: string,
  level: number,
  world: string,
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

type Gw2StandingScore = {
  id: string,
  value: number,
};

export type Gw2LadderStanding = {
  name: string,
  rank: number,
  date: string,
  scores: Array<Gw2StandingScore>,
};
