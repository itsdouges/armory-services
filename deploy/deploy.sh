if [ "$TRAVIS_BRANCH" == "master" ]; then
  npm run deploy;
else
	echo "BRANCH_NOT_SUPPORTED for deploy"
fi