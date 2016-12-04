FROM node:6.9.1
MAINTAINER madou <laheen@gmail.com>

COPY package.json package.json
RUN npm install --silent

COPY .sequelizerc .sequelizerc
COPY /scripts /scripts
COPY /config /config

ENTRYPOINT npm run db:migrate

LABEL Description="Db migrations for gw2armory"
