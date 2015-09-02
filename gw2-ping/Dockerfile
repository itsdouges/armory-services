FROM node:0.12.7

MAINTAINER madou <laheen@gmail.com>

LABEL Description="Gw2 ping container for api.armory.net.au"

WORKDIR /opt

COPY package.json /opt/package.json
RUN ["npm", "install"]

COPY /env /opt/env
COPY /spec /opt/spec
COPY /src /opt/src

RUN ["npm", "test"]

ENTRYPOINT ["npm", "start"]