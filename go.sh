#!/bin/bash

APP_VERSION="1.0.0"
APP_NAME="application"
MYSQL_PASS="password"
MYSQL_USER="admin"
MYSQL_DB="armory"
DOCKER_IMAGE_PREFIX="gw2armory"
DOCKERHUB_PREFIX="madou/$DOCKER_IMAGE_PREFIX"

log() {
  printf "\n\n== $1 ==\n\n"
}

pause() {
  printf "Pausing for $1 seconds.."

  ((t = $1))

  while ((t > 0)); do
      printf "."
      sleep 1
      ((t -= 1))
  done

  log " Finished!"
}

clean() {
  log "Cleaning up exited containers and untagged images..."
  docker ps -a | grep Exit | cut -d ' ' -f 1 | xargs docker rm
  docker images | grep "<none>" | awk '{print $3}' | xargs docker rmi -f
}

remove() {
  log "Removing container $DOCKER_IMAGE_PREFIX-$1.."
  docker rm -f "$DOCKER_IMAGE_PREFIX-$1"
}

push() {
  docker push "$DOCKERHUB_PREFIX-$1"
}

run() {
  log "Running daemon $1:$2.."

  local TAG="$DOCKERHUB_PREFIX-$1:$APP_VERSION"
  local NAME="$DOCKER_IMAGE_PREFIX-$2"

  docker run \
    -d \
    $3 \
    --name $NAME \
    -e "ENV" \
    -e "IMAGE_UPLOAD_ACCESS_KEY_ID" \
    -e "IMAGE_UPLOAD_SECRET_ACCESS_KEY" \
    -e "SES_ACCESS_KEY_ID" \
    -e "SES_SECRET_ACCESS_KEY" \
    $TAG \
    $4
}

exec() {
  log "Running $1.."

  local TAG="$DOCKERHUB_PREFIX-$APP_NAME:$APP_VERSION"
  local NAME="$DOCKER_IMAGE_PREFIX-$1"

  docker run \
    --rm \
    $3 \
    --name $NAME \
    $TAG \
    $2
}

build() {
  log "Building app image.."

  docker build \
    -t "$DOCKERHUB_PREFIX-$1:$APP_VERSION" \
    -t "$DOCKERHUB_PREFIX-$1:latest" \
    $2
}

kill() {
  remove db
  remove fetch
  remove api
}

runDb() {
  run db db "-e MYSQL_ROOT_PASSWORD=$MYSQL_PASS -e MYSQL_PASSWORD=$MYSQL_PASS -e MYSQL_USER=$MYSQL_USER -e MYSQL_DATABASE=$MYSQL_DB -p 3306:3306"

  pause 30
}

runFetch() {
  run $APP_NAME fetch "--link $DOCKER_IMAGE_PREFIX-db:db" "npm run fetch"
}

runApi() {
  run $APP_NAME api "-p 80:80 --link $DOCKER_IMAGE_PREFIX-db:db --link $DOCKER_IMAGE_PREFIX-fetch:fetch" "npm run api"
}

# Runs environment including database
dev() {
  remove db
  remove fetch
  remove api

  build db ./src/db
  build $APP_NAME .

  runDb
  runFetch
  runApi
}

setupMtr() {
  build db ./src/db
  remove db
  runDb
}

# Runs environment without database
start() {
  remove fetch
  remove api

  build $APP_NAME .

  runFetch
  runApi
}

case "$1" in
  build)
    build $APP_NAME .;;
  push)
    push $APP_NAME;;
  dev)
    dev;;
  start)
    start;;
  mtr)
    testmigrate;;
  db)
    setupMtr;;
  clean)
    clean;;
  kill)
    kill;;
  *)
    exit 1;;
esac
