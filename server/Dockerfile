FROM node:0.12.7

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/ && cp -a /tmp/package.json /opt/package.json

COPY /src /opt/app
COPY /env /opt/env

WORKDIR /opt/app

MAINTAINER madou <laheen@gmail.com>
LABEL Description="Server container for api.armory.net.au"

ENTRYPOINT ["gulp", "serve"]