FROM node:0.12.7

MAINTAINER madou <laheen@gmail.com>

LABEL Description="Gw2-fetch container for api.gw2armory.com"

WORKDIR /opt

COPY package.json /opt/package.json
RUN ["npm", "install"]

COPY /env /opt/env
COPY /spec /opt/spec
COPY /src /opt/src

RUN ["npm", "test"]

# Make sure this links up to the env config
EXPOSE 8081

ENTRYPOINT ["npm", "start"]