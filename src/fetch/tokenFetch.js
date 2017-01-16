// @flow

import throat from 'throat';

import type { Models } from 'flowTypes';

import config from 'config';
import { allSettled } from 'lib/promise';
import fetchTokens from 'lib/services/tokens';
import createLogger from 'lib/gitter';

const logger = createLogger('Token_fetchers');

type Token = {
  token: string,
  permissions: Array<string>,
};

type Fetcher = (models: Models, token: Token) => Promise<>;

export default function fetchFactory (models: Models, fetchers: Array<Fetcher>) {
  if (!fetchers || !fetchers.length) {
    throw new Error('\n=== No fetchers available! ===\n');
  }

  async function fetch (token: Token) {
    return await allSettled(fetchers.map((fetcher) => fetcher(models, token)));
  }

  async function batchFetch () {
    logger.start();

    const tokens = await fetchTokens(models);
    const results = await allSettled(tokens.map(throat(config.fetch.concurrentCalls, fetch)));
    const flattenedResults = results.reduce((acc, result) => acc.concat(result.value), []);

    logger.finish(flattenedResults);

    return flattenedResults;
  }

  return {
    batchFetch,
    fetch,
  };
}
