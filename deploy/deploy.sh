if [ "$TRAVIS_BRANCH" == "master" ]; then
  npm run build:beta;
else
	echo "BRANCH_NOT_SUPPORTED for build"
fi