FROM node:6.9.1
MAINTAINER madou <laheen@gmail.com>

COPY package.json package.json
RUN npm install --silent

COPY .babelrc .babelrc
COPY /config /config
COPY /test /test
COPY /src /src

RUN npm test
RUN npm run build

ENTRYPOINT npm start

LABEL Description="Api server for gw2armory"
