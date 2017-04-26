// @flow

import type { Models } from 'flowTypes';

type Fetcher = {
  fetcher: (Models) => any,
  interval: number,
  callImmediately?: boolean,
};

export default function initialise (models: Models, fetchers: Array<Fetcher>) {
  fetchers.forEach(({ fetcher, interval, callImmediately }) => {
    setInterval(() => fetcher(models), interval);

    if (callImmediately) {
      fetcher(models);
    }
  });
}
