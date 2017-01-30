FROM node:6.9.1
MAINTAINER madou <laheen@gmail.com>
LABEL Description="Guild Wars 2 Armory Services"

COPY package.json package.json
RUN npm install yarn -g
RUN yarn

COPY .babelrc .babelrc
COPY .sequelizerc .sequelizerc
COPY /src /src

RUN npm run build

# Expose port from fetch container.
# This is used when fetch and api containers are linked.
EXPOSE 8081
