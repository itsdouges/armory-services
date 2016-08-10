# api.gw2armory.com [![Build Status](https://travis-ci.org/madou/armory-api.svg?branch=master)](https://travis-ci.org/madou/armory-api)

## Usage

### Fire and forget

Starts three docker containers, fetch, server, and db.

```
./go.sh serve
```

### Local development

The developer experience is kind of shitty at the moment. You need to start the node servers manually in watch mode, as well as hook up a database. Currently there isn't an automated way to do this - so install `mysql 3.6`, using docker or directly on your host, and then modify the `./environment/env_config.js` DEV object.

### Copy config

```
./go.sh copy
```

### Api server

```
cd ./server
npm install
gulp test:unit:auto
```

## Fetch server

```
cd ./gw2-fetch
npm install
npm test
```

## Pull Requests

Like to contribute? Look at the [trello board](https://trello.com/b/qGvDe622/gw2armory-com) or contact me on [reddit](https://www.reddit.com/r/gw2armory) or [twitter](https://twitter.com/itsmadou) to find something you'd like to work on, then make a pull request against the `development` branch.

© 2016 ArenaNet, Michael Dougall, gw2armory.com
