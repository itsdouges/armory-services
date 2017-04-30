// @flow

import throat from 'throat';

import type { Models } from 'flowTypes';

import config from 'config';
import { allSettled } from 'lib/promise';
import { list as listTokens } from 'lib/services/tokens';
import createLogger from 'lib/logger';

const logger = createLogger('user-fetcher', 'fetch-user');

export type Fetcher$Token = {
  id: number,
  token: string,
  permissions: string,
};

type Fetcher = (models: Models, token: Fetcher$Token) => Promise<>;

export function parseResults (results: []) {
  const errors = [];
  const successes = [];
  const removed = [];
  const permissions = [];

  results.forEach((result) => {
    if (result.state === 'fulfilled') {
      successes.push(result);
      return;
    }

    if (result.value.status === 400) {
      removed.push(result);
    } else if (result.value.status === 403) {
      permissions.push(result);
    } else {
      errors.push(result);
    }
  });

  return {
    errors,
    successes,
    removed,
    permissions,
  };
}

async function logResults (results) {
  const { errors, successes, removed, permissions } = parseResults(results);

  if (errors.length) {
    await Promise.all(errors.map((error) => logger.error(error.value)));
  }

  logger.finish(`${successes.length} requests succeeded
${errors.length} requests errored
${removed.length} requests failed because they were deleted from arenanet account page
${permissions.length} requests lacked permissions
`);
}

export default function fetchFactory (models: Models, fetchers: Array<Fetcher>) {
  if (!fetchers || !fetchers.length) {
    throw new Error('>>> No fetchers available!');
  }

  async function fetch (token: Fetcher$Token) {
    return await allSettled(fetchers.map((fetcher) => fetcher(models, token)));
  }

  async function fetchAll () {
    logger.start();

    const tokens = await listTokens(models);
    const results = await allSettled(tokens.map(throat(config.fetch.concurrentCalls, fetch)));
    const flattenedResults = results.reduce((acc, result) => acc.concat(result.value), []);

    logResults(flattenedResults);

    return flattenedResults;
  }

  return {
    fetchAll,
    fetch,
  };
}
