FROM node:6.3.1

MAINTAINER madou <laheen@gmail.com>
LABEL Description="Api server for api.gw2armory.com"

WORKDIR /opt

COPY package.json /opt/package.json
RUN npm install --silent

COPY .sequelizerc /opt/.sequelizerc
COPY /scripts /opt/scripts
COPY /config /opt/config
COPY /test /opt/test
COPY /src /opt/src

RUN npm test

ENTRYPOINT npm start
