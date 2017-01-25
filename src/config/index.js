const ENVIRONMENT = process.env.ENV || 'DEV';
const { merge } = require('lodash');

switch (ENVIRONMENT) {
  case 'DEV':
  case 'PROD':
  case 'TEST':
  case 'ABCD':
  case 'local':
    break;

  default:
    throw new Error(`${ENVIRONMENT} is not a supported environment!`);
}

console.log(`\n== Running with ${ENVIRONMENT} settings. ==\n`);

module.exports = merge(
  {},
  require('./default'),
  require(`./${ENVIRONMENT.toLowerCase()}`)
);
