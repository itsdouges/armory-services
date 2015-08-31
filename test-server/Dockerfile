FROM node:0.12.7

MAINTAINER madou <laheen@gmail.com>
LABEL Description="Acceptance test server container for api.gw2armory.com"

WORKDIR /opt

RUN npm install -g jasmine-node

COPY package.json /opt/package.json
RUN npm install

COPY /spec /opt/spec

ENTRYPOINT ["npm", "test"]