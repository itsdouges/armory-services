FROM node:6.3.1

MAINTAINER madou <laheen@gmail.com>
LABEL Description="Api server for api.gw2armory.com"

WORKDIR /opt

RUN npm install -g gulp

COPY package.json /opt/package.json
RUN npm install

COPY gulpfile.js /opt/gulpfile.js
COPY /gulp /opt/gulp
COPY /config /opt/config
COPY /migrations /opt/migrations
COPY /env /opt/env
COPY /spec /opt/spec
COPY /src /opt/src

RUN npm test

ENTRYPOINT npm start
