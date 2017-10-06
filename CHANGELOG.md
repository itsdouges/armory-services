# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][]
### Added
- Calculated item stats resource

### Fixed
- Logging serialization

## [3.7.2][] - 2017-09-27
### Changed
- User access to be array based output

## [3.7.1][] - 2017-09-22
### Changed
- Use `serialize-error` to parse errors to logger

## [3.7.0][] - 2017-09-21
### Added
- Missing user api proxy routes

## [3.6.0][] - 2017-09-07
### Removed
- CORS origin restrictions

## [3.5.0][] - 2017-09-06
### Added
- Season data to pvp leaderboards endpoint

## [3.4.5][] - 2017-09-02
### Fixed
- Response not being sent back for unclaimed users
- Sequelize request not bringing back associated models

## [3.4.4][] - 2017-08-29
### Changed
- Updated sequelize
- Updated restify
- Other dependencies

## [3.4.3][] - 2017-08-27
### Fixed
- Humanizes specific errors to not get crazy objects inside slack

## [3.4.2][] - 2017-08-16
### Changed
- Use `circular-json` dep instead of `JSON.stringify` for error logging

## [3.4.1][] - 2017-08-15
### Changed
- Upgrades deps

## [3.4.0][] - 2017-08-06
### Added
- Ability to reclaim api token when removed from arenanet but not the armory

## [3.3.1][] - 2017-06-05
### Changed
- EB environment to single instance to reduce costs

## [3.3.0][] - 2017-06-04
### Added
- New privacy system for all resources
- New data for users

## [3.2.6][] - 2017-05-19
### Fixed
- Slack messaging not working

## [3.2.5][] - 2017-05-18
### Fixed
- Sitemap index not generating all pages

## [3.2.4][] - 2017-05-18
### Fixed
- Xml parser wrecking it

## [3.2.3][] - 2017-05-18
### Changed
- Sitemap to be calculated in a performant manner

## [3.2.2][] - 2017-05-06
### Fixed
- Character and user authentication causing problems for authenticated users


## [3.2.1][] - 2017-04-30
### Fixed
- Api token migration script

## [3.2.0][] - 2017-04-30
### Fixed
- Pvp fetcher fetching when user doesn't have pvp permissions
- Guilds of the day to be cached for the day

### Changed
- Fetch logging to be more granular

### Added
- Api token invalidator
- Log when unhandled rejections/errors happen

## [3.1.0][] - 2017-04-28
### Added
- Try fetch capability to all resources

## [3.0.1][] - 2017-04-27
### Changed
- Gitter to slack logging

## [3.0.0][] - 2017-04-26
### Changed
- Babel configuration to use `babel-preset-env`
- Docker images to use node `7.8.0`
- Leaderboard pagination to match everything else
- Guild members to be orded by armory users first
- Gw2 api fetch to cache in memory for 5 minutes

### Removed
- Characters from base guild resource
- Characters from user resource
- Users from base guild resource

### Added
- guild/characters resource
- guild/users resource
- Characters/guilds of the day

### Fixed
- Guild resource to return 404 if not found

## [2.4.0] - 2017/04/05
### Added
- Character tabs to sitemap

## [2.3.0] - 2017/03/29
### Changed
- Deployment process to deploy to production with tagged commits

### Added
- Precommit hook
- Code coverage

## [2.2.8] - 2017/03/29
### Changed
- Fetch config to fetch as slow as possible for now

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


[Unreleased]: https://github.com/madou/armory-back/compare/v3.7.2...HEAD
[3.7.2]: https://github.com/madou/armory-back/compare/v3.7.1...v3.7.2
[3.7.1]: https://github.com/madou/armory-back/compare/v3.7.0...v3.7.1
[3.7.0]: https://github.com/madou/armory-back/compare/v3.6.0...v3.7.0
[3.6.0]: https://github.com/madou/armory-back/compare/v3.5.0...v3.6.0
[3.5.0]: https://github.com/madou/armory-back/compare/v3.4.5...v3.5.0
[3.4.5]: https://github.com/madou/armory-back/compare/v3.4.4...v3.4.5
[3.4.4]: https://github.com/madou/armory-back/compare/v3.4.3...v3.4.4
[3.4.3]: https://github.com/madou/armory-back/compare/v3.4.2...v3.4.3
[3.4.2]: https://github.com/madou/armory-back/compare/v3.4.1...v3.4.2
[3.4.1]: https://github.com/madou/armory-back/compare/v3.4.0...v3.4.1
[3.4.0]: https://github.com/madou/armory-back/compare/v3.3.1...v3.4.0
[3.3.1]: https://github.com/madou/armory-back/compare/v3.3.0...v3.3.1
[3.3.0]: https://github.com/madou/armory-back/compare/v3.2.6...v3.3.0
[3.2.6]: https://github.com/madou/armory-back/compare/v3.2.5...v3.2.6
[3.2.5]: https://github.com/madou/armory-back/compare/v3.2.4...v3.2.5
[3.2.4]: https://github.com/madou/armory-back/compare/v3.2.3...v3.2.4
[3.2.3]: https://github.com/madou/armory-back/compare/v3.2.2...v3.2.3
[3.2.2]: https://github.com/madou/armory-back/compare/v3.2.1...v3.2.2
[3.2.1]: https://github.com/madou/armory-back/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/madou/armory-back/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/madou/armory-back/compare/v3.0.1...v3.1.0
[3.0.1]: https://github.com/madou/armory-back/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/madou/armory-back/tree/v3.0.0
