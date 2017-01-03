# docker login -e="$DOCKER_EMAIL" -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"

PROD_BRANCH=master
TEST_BRANCH=feature/PvpSeasons

if [ "$TRAVIS_BRANCH" == $PROD_BRANCH ]; then
  echo "Deploying to $PROD_BRANCH"
  bash ./go.sh push
  ENV=PROD npm run deploy;
elif [ "$TRAVIS_BRANCH" == $TEST_BRANCH ]; then
  echo "Deploying to $TEST_BRANCH"
  bash ./go.sh push
  ENV=TEST npm run deploy;
else
  echo "BRANCH_NOT_SUPPORTED for deploy"
fi
