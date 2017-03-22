# Change Log

## Log structure

```
## [Unreleased|major.minor.patch] - yyyy/mm/dd
### Added|Changed|Fixed|Removed
- Changes
```

## [2.2.7] - 2017/03/23
### Changed
- Fetch to be enabled

## [2.2.6] - 2017/03/21
### Fixed
- `getLatestPvpSeason` from breaking half the site when GW2API is down

## [2.2.5] - 2017/03/20
### Fixed
- Users `me` resource from not catching exception and returning

## [2.2.4] - 2017/03/20
### Changed
- Turned off fetch temporarily while gw2 apis are down

## [2.2.3] - 2017/03/08
### Fixed
- User image uploads from not working

## [2.2.2] - 2017/03/07
### Added
- Corrects changelog

## [2.2.1] - 2017/03/01
### Removed
- CORS restrictions

## [2.2.0] - 2017/02/27
### Added
- Version to healthcheck endpoint

## [2.1.1] - 2017/02/27
### Removed
- Standing stats for wins/losses from being fetched (it's a combined wins/losses, not specific to the current season!). If https://github.com/arenanet/api-cdi/issues/452 is ever implemented, add this back.

## [2.1.0] - 2017/02/25
### Added
- Wins/losses to user resource

## [2.0.0] - 2017/02/25
### Added
- Wins/losses to pvp standings

### Removed
- Properties from leaderboard endpoints that weren't needed

## [1.7.1] - 2017/02/20
### Fixed
- Local environment from not being able to start up correctly

## [1.7.0] - 2017/02/16
### Added
- Advanced health check for beanstalk

## [1.6.3] - 2017/02/13
### Changed
- Gw2 api to filter out undefined items

## [1.6.2] - 2017/02/03
### Changed
- Sitemap code to be a little cleaner
- Travis ci to use yarn by the official means

## [1.6.1] - 2017/02/03
### Changed
- Sitemap to be paginated

## [1.6.0] - 2017/02/03
### Added
- Leaderboard pagination

### Fixed
- Leaderboard calculation from not clearing na/eu users who dropped off the ladder
- Leaderboard calculation throwing because expected values from service were not being returned

## [1.5.3] - 2017/02/02
### Changed
- List pvp standings service to serve associated user data

### Fixed
- List pvp standings to not serve null users

## [1.5.2] - 2017/01/31
### Fixed
- Config from throwing

### Changed
- Healthcheck url in beanstalk
- Resources to use es6 exports

## [1.5.1] - 2017/01/31
### Changed
- Interval for recalculating leaderboards
- Interval for fetching leaderboard data
- Config declarations

### Added
- Small time module for converting hours/minutes to milliseconds

## [1.5.0] - 2017/01/30
### Added
- Eu/na pvp leaderboard data fetch
- Stub user generation for leaderboards and guilds
- Stub user claim (new user/existing user with apiToken)
- Healthcheck
- Local db migration test run
- Pvp leaderboard endpoints

### Fixed
- Guild motd from not being saved to db if using obsucure unicode characters
- Guild from not being added to db if tag is not defined

### Changed
- Cleaned up config
- Api token primary key and supporting foreign keys $$_MIGRATIONS_$$
- Consolidated gitter logging to be used in other modules
- User count statistics to be split between stub and real

## [1.4.1] - 2017/01/15
### Fixed
- Users appearing high in the ladder if their rank is `null`

## [1.4.0] - 2017/01/14
### Fixed
- Some data leaking out that shouldn't from pvp leaderboard

### Added
- Endpoints for `na`, `eu`, and `gw2a` pvp leaderboards. Still need to get the data though !

## [1.3.0] - 2017/01/13
### Added
- `gw2aRank` and `naRank` to `PvpStandings` table
- Pvp leaderboard fetcher to calculate gw2aRank and save it to the database
- Read pvp ladder service

### Changed
- User service, controller major refactors

## [1.2.2] - 2017/01/08
### Fixed
- Sitemap to not have empty `lastmod` fields

## [1.2.1] - 2017/01/08
### Changed
- Pvp leaderboard to order with decay in consideration

## [1.2.0] - 2017/01/07
### Changed
- Sitemap to have `priority` and `lastmod`
- Sitemap to have guild tabs

## [1.1.0] - 2017/01/07
### Added
- PvpStandings table to db
- Pvp standings data fetcher
- Current pvp season leaderboard

## [1.0.0] - 2017/01/02
### Added
- This CHANGELOG file to allow more insight to the changes made throughout the development of api.gw2armory.com
