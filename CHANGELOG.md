# Change Log

## Log structure

```
## [Unreleased|major.minor.patch] - yyyy/mm/dd
### Added|Changed|Fixed|Removed
- Changes
```

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
