FROM node:6.3.1

MAINTAINER madou <laheen@gmail.com>
LABEL Description="Fetch micro-service for api.gw2armory.com"

WORKDIR /opt

COPY package.json /opt/package.json
RUN npm install --silent

COPY /config /opt/config
COPY /test /opt/test
COPY /src /opt/src

RUN npm test

# Make sure this links up to the env config
EXPOSE 8081

ENTRYPOINT npm start
