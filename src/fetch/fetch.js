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
    const func = () => fetcher(models);

    setInterval(() => logger.catchLog(func), interval);

    if (callImmediately) {
      logger.catchLog(func);
    }
  });
}
