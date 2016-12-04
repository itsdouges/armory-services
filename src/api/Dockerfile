FROM node:6.9.1

COPY package.json package.json
RUN npm install --silent

COPY /config /config
COPY /test /test
COPY /src /src

RUN npm test

ENTRYPOINT npm start

MAINTAINER madou <laheen@gmail.com>
LABEL Description="Api server for api.gw2armory.com"
