FROM node:0.12.7

MAINTAINER madou <laheen@gmail.com>

LABEL Description="Auth container for api.armory.net.au."

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/ && cp -a /tmp/package.json /opt/package.json

COPY /src /opt/app

WORKDIR /opt

ENTRYPOINT ["node", "app/auth.js"]