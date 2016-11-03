const q = require('q');
const throat = require('throat');

const fetchTokens = require('./lib/tokens');
const config = require('../config');

function fetchFactory (models, fetchers) {
  if (!fetchers || !fetchers.length) {
    throw new Error('\n=== No fetchers available! ===\n');
  }

  function fetch (token) {
    return fetchers.reduce(
      (promise, fetcher) => promise.then(() => fetcher(models, token)),
      Promise.resolve()
    );
  }

  function batchFetch () {
    console.log('\n=== Starting batch fetch! ===\n');

    return fetchTokens(models)
      .then((tokens) => {
        return q.allSettled(tokens.map(throat(fetch, config.fetch.concurrentCalls)));
      })
      .then(() => {
        console.log('\n=== Finished fetch! ===\n');
      }, (e) => {
        console.error('\n=== Something bad happened! ===\n');
        console.trace(e);
      });
  }

  return {
    batchFetch,
    fetch,
  };
}

module.exports = fetchFactory;
