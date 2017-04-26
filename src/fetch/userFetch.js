// @flow

import throat from 'throat';

import type { Models } from 'flowTypes';

import config from 'config';
import { allSettled } from 'lib/promise';
import { list as listTokens } from 'lib/services/tokens';
import createLogger from 'lib/logger';

const logger = createLogger('userFetchers', 'fetch-user');

export type Fetcher$Token = {
  id: number,
  token: string,
  permissions: string,
};

type Fetcher = (models: Models, token: Fetcher$Token) => Promise<>;

export default function fetchFactory (models: Models, fetchers: Array<Fetcher>) {
  if (!fetchers || !fetchers.length) {
    throw new Error('>>> No fetchers availabl');
  }

  async function fetch (token: Fetcher$Token) {
    return await allSettled(fetchers.map((fetcher) => fetcher(models, token)));
  }

  async function fetchAll () {
    logger.start();

    const tokens = await listTokens(models);
    const results = await allSettled(tokens.map(throat(config.fetch.concurrentCalls, fetch)));
    const flattenedResults = results.reduce((acc, result) => acc.concat(result.value), []);

    logger.finish(flattenedResults);

    return flattenedResults;
  }

  return {
    fetchAll,
    fetch,
  };
}
