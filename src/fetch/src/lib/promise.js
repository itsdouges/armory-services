// eslint-disable-next-line import/prefer-default-export
export function allSettled (promises) {
  const wrappedPromises = promises
    .map((p) => Promise.resolve(p)
      .then(
        (val) => ({ state: 'fulfilled', value: val }),
        (err) => ({ state: 'rejected', value: err })
      )
    );

  return Promise.all(wrappedPromises);
}
