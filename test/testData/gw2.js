import type {
  Gw2PvpStanding,
  Gw2Character,
  Gw2LadderStanding,
} from 'flowTypes';

import { guild } from './db';

export const leaderboardStanding = ({
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

const fakeStanding = {
  total_points: 26,
  division: 0,
  tier: 1,
  points: 6,
  repeats: 0,
  rating: 1159,
  decay: 123,
};

export const pvpStanding = ({
  current = { ...fakeStanding },
  best = { ...fakeStanding },
  // eslint-disable-next-line camelcase
  season_id = 'A54849B7-7DBD-4958-91EF-72E18CD659BA',
}: Gw2PvpStanding = {}): Gw2PvpStanding => ({
  current,
  best,
  season_id,
});

export const pvpSeason = (id: string = '1234-1234') => ({
  season_id: id,
  id,
});

export const character = ({
  name = 'mdouuuu',
  race = 'race',
  gender = 'Male',
  profession = 'Elementalist',
  level = 20,
  age = 30,
  deaths = 10,
  guild: gld = guild().name,
  created = '12/11/1990',
}: Gw2Character = {}): Gw2Character => ({
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
