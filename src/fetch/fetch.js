// @flow

import type { Models } from 'flowTypes';

import createLogger from 'lib/logger';

const logger = createLogger('Fetcher', 'fetch-pvp');

type Fetcher = {
  fetcher: (Models) => any,
  interval: number,
  callImmediately?: boolean,
};

export default function initialise (models: Models, fetchers: Array<Fetcher>) {
  fetchers.forEach(({ fetcher, interval, callImmediately }) => {
    const func = logger.catchLog(() => fetcher(models));

    setInterval(func, interval);

    if (callImmediately) {
      func();
    }
  });
}
