FROM node:6.9.1
MAINTAINER madou <laheen@gmail.com>

COPY package.json /package.json
RUN npm install --silent

COPY /config /config
COPY /test /test
COPY /src /src

RUN npm test

# Make sure this links up to the env config
EXPOSE 8081

ENTRYPOINT npm start

LABEL Description="Fetch service for gw2armory"
