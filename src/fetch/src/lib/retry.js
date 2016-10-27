const _ = require('lodash');

module.exports = ({ retryPredicate = _.noop, retryCount = 5 } = {}) => (promiseFunc) => {
  let retries = retryCount;

  return function retry (...args) {
    return promiseFunc(...args).catch((e) => {
      if (retryPredicate(e) && retries > 1) {
        retries -= 1;
        return retry(...args);
      }

      return Promise.reject(e);
    });
  };
};
