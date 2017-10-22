# api.gw2armory.com

[![Build Status](https://travis-ci.org/madou/armory-services.svg?branch=master)](https://travis-ci.org/madou/armory-services) [![Dependencies](https://david-dm.org/madou/armory-react.svg)](https://david-dm.org/madou/armory-services)
[![Dev Dependencies](https://david-dm.org/madou/armory-react/dev-status.svg)](https://david-dm.org/madou/armory-services?type=dev) 
[![codecov](https://codecov.io/gh/madou/armory-services/branch/master/graph/badge.svg)](https://codecov.io/gh/madou/armory-services)
[![Discord](https://img.shields.io/badge/discord-GW2Armory-blue.svg)](https://discord.gg/3BRbV7b)
[![Patreon](https://img.shields.io/badge/patreon-Become%20a%20Patreon-green.svg)](https://www.patreon.com/bePatron?u=5546924)

## Usage

### Quick start

tl;dr -> develop with `npm run tdd` and `npm run tdd:int`, use `npm run dev` to run local environment.

### User image uploads

To have image uploads working locally you'll need a valid aws key/secret pair. Run it like so:

```bash
IMAGE_UPLOAD_ACCESS_KEY_ID=ACCESSKEYHERE IMAGE_UPLOAD_SECRET_ACCESS_KEY=SECRETKEYHERE npm run dev
```

### Email notifications

To have email notification working locally you'll need a valid aws key/secret pair. Run it like so:

```bash
SES_ACCESS_KEY_ID=ACCESSKEYHERE SES_SECRET_ACCESS_KEY=SECRETKEYHERE npm run dev
```

### Database migrations

Ensure any database migration is backwards compatible with a previous version of the api. This will keep deployments simple and clean.

```bash
ENV={ENV} npm run migrate
```

#### Migration test runs

##### Prepare step

Starts a database container and exposes it to 127.0.0.1:3306

```bash
npm run mtr-prepare
```

##### Run step

Runs the migration against the test database. Make sure to have your migrations written in `src/migration/scripts`, with the db models in their origin (pre-migrated) state in `src/lib/models`.

```bash
npm run mtr
```

##### Revert step

Run after running test migration to roll back changes.

```bash
npm run mtr-revert
```

## Deployments

Deployments to production are triggered by tagged commits, tag with `npm version major|minor|patch`. Deployments to test are done adhoc and are _almost_ manual.

## Pull Requests

Like to contribute? Look at the [issues](https://github.com/madou/armory-services/issues) tab or contact me on [reddit](https://www.reddit.com/r/gw2armory) or [twitter](https://twitter.com/itsmadou) to find something you'd like to work on, then make a pull request against the `master` branch.

© 2015-present gw2armory.com
