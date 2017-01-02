#!/bin/bash

APP_NAME="application"
MYSQL_PASS="password"
MYSQL_USER="admin"
MYSQL_DB="armory"
VERSION=$VERSION

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
  log "Removing container gw2armory-$1.."
  docker rm -f "gw2armory-$1"
}

push() {
  docker push "madou/gw2armory-$1"
}

runDaemon() {
  log "Running daemon $1:$2.."

  docker run \
    -d \
    $3 \
    --name "gw2armory-$2" \
    -e "ENV" \
    -e "IMAGE_UPLOAD_ACCESS_KEY_ID" \
    -e "IMAGE_UPLOAD_SECRET_ACCESS_KEY" \
    -e "SES_ACCESS_KEY_ID" \
    -e "SES_SECRET_ACCESS_KEY" \
    "madou/gw2armory-$1:$VERSION" \
    $4
}

run() {
  log "Running $1.."

  docker run \
    --name "gw2armory-$2" \
    -e "ENV" \
    -e "IMAGE_UPLOAD_ACCESS_KEY_ID" \
    -e "IMAGE_UPLOAD_SECRET_ACCESS_KEY" \
    -e "SES_ACCESS_KEY_ID" \
    -e "SES_SECRET_ACCESS_KEY" \
    "madou/gw2armory-$1:$VERSION"
}

build() {
  log "Building app image.."

  docker build \
    -t "madou/gw2armory-$1:$VERSION" \
    -t "madou/gw2armory-$1:latest" \
    $2
}

dev() {
  remove db
  remove fetch
  remove api

  runDaemon db db "-e MYSQL_ROOT_PASSWORD=$MYSQL_PASS -e MYSQL_PASSWORD=$MYSQL_PASS -e MYSQL_USER=$MYSQL_USER -e MYSQL_DATABASE=$MYSQL_DB"

  pause 10

  runDaemon $APP_NAME fetch "--link gw2armory-db:db" "npm run fetch"
  runDaemon $APP_NAME api "-p 80:80 --link gw2armory-db:db --link gw2armory-fetch:fetch" "npm run api"
}

case "$1" in
  build)
    build db .src/db
    build $APP_NAME .;;
  push)
    push $APP_NAME;;
  dev)
    dev;;
  *)
    exit 1;;
esac
