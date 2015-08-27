FROM node:0.12.7

MAINTAINER madou <laheen@gmail.com>
LABEL Description="Server container for api.armory.net.au"

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/src && cp -a /tmp/node_modules /opt/src/ && cp -a /tmp/package.json /opt/package.json

WORKDIR /opt

COPY package.json /opt/package.json
RUN npm install

COPY gulpfile.js /opt/gulpfile.js
COPY /src /opt/src
COPY /env /opt/env

ENTRYPOINT ["npm", "start"]