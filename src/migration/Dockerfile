FROM node:6.3.1

WORKDIR /opt

COPY package.json /opt/package.json
RUN npm install --silent

COPY .sequelizerc /opt/.sequelizerc
COPY /scripts /opt/scripts
COPY /config /opt/config

ENTRYPOINT npm run db:migrate

MAINTAINER madou <laheen@gmail.com>
LABEL Description="Database migrations for gw2armory"
