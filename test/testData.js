import moment from 'moment';

import type {
  Gw2PvpStanding,
  User,
  Guild,
  ApiToken,
  Character,
  PasswordReset,
  Gw2LadderStanding,
} from 'flowTypes';

export const user = ({
  id = '938C506D-F838-F447-8B43-4EBF34706E0445B2B503',
  email = 'cool@email.com',
  password = 'cool-pass',
  passwordHash = 'realhashseriously',
  alias = 'huedwell',
  token = '12222-2222',
  guilds,
}: User = {}): User => ({
  id,
  email,
  password,
  passwordHash,
  alias,
  token,
  guilds,
});

export const guild = ({
  id = 'im-guild',
  tag = 'tag',
  name = 'name',
  favor = 123,
  resonance = 333,
  aetherium = 444,
  influence = 555,
  level = 60,
  motd = 'Cool message of the day',
  claimed = false,
}: Guild = {}): Guild => ({
  id,
  tag,
  name,
  favor,
  resonance,
  aetherium,
  influence,
  level,
  motd,
  claimed,
});

export const apiToken = ({
  id = 1,
  token = '938C506D-F838-F447-8B43-4EBF34706E0445B2B503-977D-452F-A97B-A65BB32D6F15',
  accountName = 'cool.4321',
  accountId = 'haha_id',
  permissions = 'cool,permissions',
  world = 1234,
  guilds = guild().id,
  User: Usr = user(),
  UserId = user().id,
  access = 'HOT',
  commander = true,
  fractalLevel = 123,
  dailyAp = 123,
  monthlyAp = 123,
  wvwRank = 123,
  primary = false,
}: ApiToken = {}): ApiToken => ({
  id,
  token,
  accountName,
  accountId,
  permissions,
  world,
  guilds,
  User: Usr,
  UserId,
  access,
  commander,
  fractalLevel,
  dailyAp,
  monthlyAp,
  wvwRank,
  primary,
});

export const character = ({
  name = 'maaodduu',
  race = 'Asura',
  gender = 'Male',
  profession = 'Elementalist',
  level = 20,
  created = '01/02/1990',
  age = 30,
  deaths = 10,
  guild: gld = guild().name,
  Gw2ApiTokenId = apiToken().id,
  Gw2ApiToken = apiToken(),
  showPublic,
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
  Gw2ApiTokenId,
  Gw2ApiToken,
  showPublic,
});

export const characterModel = ({
  name = 'mdouuuu',
  race = 'race',
  gender = 'Male',
  profession = 'Elementalist',
  level = 20,
  age = 30,
  deaths = 10,
  guild: gld = guild().name,
  created = '12/11/1990',
}: Character = {}): Character => ({
  name,
  race,
  gender,
  profession,
  level,
  age,
  deaths,
  guild: gld,
  created,
});

const fakeStanding = {
  total_points: 26,
  division: 0,
  tier: 1,
  points: 6,
  repeats: 0,
  rating: 1159,
  decay: 123,
};

export const pvpSeason = (id: string = '1234-1234') => ({
  season_id: id,
  id,
});

// $FlowFixMe
export const dbStanding = ({
  apiToken: apiTokenId = apiToken().id,
  seasonId = pvpSeason().season_id,
  totalPointsCurrent = 1,
  divisionCurrent = 2,
  pointsCurrent = 3,
  repeatsCurrent = 4,
  ratingCurrent = 5,
  decayCurrent = 6,
  totalPointsBest = 7,
  divisionBest = 8,
  pointsBest = 9,
  repeatsBest = 10,
  ratingBest = 11,
  decayBest = 12,
  gw2aRank = 1,
  naRank = null,
  euRank = null,
} = {}) => ({
  apiToken: apiTokenId,
  seasonId,
  totalPointsCurrent,
  divisionCurrent,
  pointsCurrent,
  repeatsCurrent,
  ratingCurrent,
  decayCurrent,
  totalPointsBest,
  divisionBest,
  pointsBest,
  repeatsBest,
  ratingBest,
  decayBest,
  gw2aRank,
  naRank,
  euRank,
});

export const standing = ({
  current = fakeStanding,
  best = fakeStanding,
  // eslint-disable-next-line camelcase
  season_id = 'A54849B7-7DBD-4958-91EF-72E18CD659BA',
}: Gw2PvpStanding = {}): Gw2PvpStanding => ({
  current,
  best,
  season_id,
});

export const passwordReset = ({
  expires = moment().add(1, 'days'),
  used = false,
  UserId = user().id,
}: PasswordReset = {}) => ({
  expires,
  used,
  UserId,
});

export const gw2LadderStanding = ({
  name = 'madou.1234',
  rank = 201,
  date = '2017-01-13T13:07:52Z',
}: Gw2LadderStanding = {}) => ({
  name,
  rank,
  date,
  scores: [{
    id: '0F86D504-63C2-4465-80AA-C278E1CB7800',
    value: 1775,
  }, {
    id: '8A5F1199-CFD8-44CE-84C3-811C5EE8B16C',
    value: 28,
  }, {
    id: 'FECEE3A5-B66C-44A3-B81E-65EA43829E1D',
    value: 9,
  }],
});
