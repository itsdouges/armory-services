FROM node:7.10.1-slim
MAINTAINER madou <laheen@gmail.com>
LABEL Description="Guild Wars 2 Armory Services"

RUN apt-get update
RUN apt-get install git-all
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN $HOME/.yarn/bin/yarn install

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn

COPY .babelrc .babelrc
COPY .sequelizerc .sequelizerc
COPY /src /src

RUN npm run build

# Expose port from fetch container.
# This is used when fetch and api containers are linked.
EXPOSE 8081
