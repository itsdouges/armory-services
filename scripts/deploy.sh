#!/bin/bash

TEST_BRANCH=feature/ReclaimToken

docker login -e="$DOCKER_EMAIL" -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"

if [ "$TRAVIS_TAG" ]; then
  echo ""
  echo "=> Deploying $TRAVIS_TAG to api.gw2armory.com"
  echo ""

  bash ./go.sh push
  ENV=PROD npm run deploy;
elif [ "$TRAVIS_BRANCH" == $TEST_BRANCH ]; then
  echo ""
  echo "=> Deploying $TRAVIS_BRANCH to test environment"
  echo ""

  bash ./go.sh push
  ENV=TEST npm run deploy;
else
  echo ""
  echo "=> $TRAVIS_BRANCH not allowed to deploy"
  echo ""
fi
