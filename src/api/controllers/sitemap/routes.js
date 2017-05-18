// @flow

export const userRoutes = [{
  loc: '',
  priority: '1.0',
}, {
  loc: '/characters',
  priority: '0.9',
}, {
  loc: '/matches',
  priority: '0.5',
}, {
  loc: '/guilds',
  priority: '0.5',
}];

export const guildRoutes = [{
  loc: '',
  priority: '0.9',
}, {
  loc: '/users',
  priority: '0.8',
}, {
  loc: '/characters',
  priority: '0.8',
}, {
  loc: '/logs',
  priority: '0.4',
}];

export const characterRoutes = [{
  loc: '',
  priority: '1.0',
}, {
  loc: '/pvp',
  priority: '0.9',
}, {
  loc: '/wvw',
  priority: '0.9',
}, {
  loc: '/bags',
  priority: '0.9',
}];

export const publicRoutes = [{
  loc: '',
  priority: '1.0',
  changefreq: 'daily',
}, {
  loc: 'join',
  priority: '0.6',
}, {
  loc: 'login',
  priority: '0.5',
}, {
  loc: 'statistics',
  priority: '0.9',
}, {
  loc: 'leaderboards/pvp',
  priority: '0.9',
  changefreq: 'hourly',
}, {
  loc: 'leaderboards/pvp/na',
  changefreq: 'hourly',
  priority: '0.9',
}, {
  loc: 'leaderboards/pvp/eu',
  changefreq: 'hourly',
  priority: '0.9',
}, {
  loc: 'embeds',
  priority: '0.4',
}];
