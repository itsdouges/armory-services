# api.gw2armory.com [![Build Status](https://travis-ci.org/madou/armory-back.svg?branch=master)](https://travis-ci.org/madou/armory-back)

## Usage

### Fire and forget

Starts up three docker containers, fetch, server, and db.

```
npm run dev
```

#### User image uploads

To have image uploads working locally you'll need a valid aws key/secret pair. Run it like so:

```
IMAGE_UPLOAD_ACCESS_KEY_ID=ACCESSKEYHERE IMAGE_UPLOAD_SECRET_ACCESS_KEY=IMAGEKEYHERE npm run dev
```

#### Email notifications

To have email notification working locally you'll need a valid aws key/secret pair. Run it like so:

```
SES_ACCESS_KEY_ID=ACCESSKEYHERE SES_SECRET_ACCESS_KEY=IMAGEKEYHERE npm run dev
```

### Local development

The developer experience is kind of shitty at the moment. You need to start the node servers manually in watch mode, as well as hook up a database. Currently there isn't an automated way to do this - so install `mysql 3.6`, using docker or directly on your host, and then modify the `./src/common/env/env_config.js` DEV object.

### Copy common files

As docker can't access files in a parent directory, and we need them for local develoment, this script is used.

It copies `db models` and `env_config.js` to `src/fetch` and `src/api` folders.

```
npm run copy-common
```

## Pull Requests

Like to contribute? Look at the [trello board](https://trello.com/b/qGvDe622/gw2armory-com) or contact me on [reddit](https://www.reddit.com/r/gw2armory) or [twitter](https://twitter.com/itsmadou) to find something you'd like to work on, then make a pull request against the `development` branch.

© 2016 ArenaNet, Michael Dougall, gw2armory.com
