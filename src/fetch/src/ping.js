const q = require('q');
const throat = require('throat');

const fetchTokens = require('./lib/tokens');
const config = require('../env');

function pingControllerFactory (models, fetchers) {
  return function ping () {
    return fetchTokens(models)
      .then((tokens) => {
        return q.allSettled(
          tokens.map(throat((token) =>
            fetchers.reduce(
              (promise, fetcher) => promise.then(() => fetcher(models, token)),
              Promise.resolve()
            ),
          config.ping.concurrentCalls))
        );
      })
      .then(() => {
        console.log('\n=== Finished fetch! ===\n');
      }, (e) => {
        console.error('\n=== Something bad happened ===\n');
        console.trace(e);
      });
  };
}

module.exports = pingControllerFactory;
