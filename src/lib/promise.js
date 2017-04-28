// @flow

export function allSettled (promises: Array<Promise<*>>) {
  const wrappedPromises = promises
    .map((p) => Promise.resolve(p)
      .then(
        (val) => ({ state: 'fulfilled', value: val }),
        (err) => ({ state: 'rejected', value: err })
      )
    );

  return Promise.all(wrappedPromises);
}

export const defer = () => {
  let resolve;
  let reject;

  const promise = new Promise((rslv, rjct) => {
    resolve = rslv;
    reject = rjct;
  });

  promise.catch(() => {});

  return {
    resolve,
    reject,
    promise,
  };
};
