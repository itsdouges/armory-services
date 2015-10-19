if [ "$TRAVIS_BRANCH" == "master" ]; then
  ENV=BETA npm run build;
else
	echo "BRANCH_NOT_SUPPORTED for build"
fi