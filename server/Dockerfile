FROM node:0.12.7

MAINTAINER madou <laheen@gmail.com>
LABEL Description="Server container for api.armory.net.au"

WORKDIR /opt

COPY package.json /opt/package.json
RUN npm install

COPY gulpfile.js /opt/gulpfile.js
COPY /src /opt/src
COPY /env /opt/env

ENTRYPOINT ["npm", "start"]