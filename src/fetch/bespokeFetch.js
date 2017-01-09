// @flow

import type { Models } from 'flowTypes';

type BespokeFetcher = {
  fetcher: (Models) => any,
  interval: number,
  callImmediately?: boolean,
};

export default function initialise (models: Models, fetchers: Array<BespokeFetcher>) {
  fetchers.forEach(({ fetcher, interval, callImmediately }) => {
    setInterval(fetcher, interval);

    if (callImmediately) {
      fetcher(models);
    }
  });
}
