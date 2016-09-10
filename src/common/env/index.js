/* THIS IS COPIED FROM COMMON/ENV */

const ENVIRONMENT = process.env.ENV || 'DEV';

switch (ENVIRONMENT) {
  case 'DEV':
  case 'PROD':
  case 'TEST':
    break;

  default:
    throw new Error(`${ENVIRONMENT} is not a supported environment!`);
}

console.log(`\n== Running with ${ENVIRONMENT} settings. ==\n`);

module.exports = Object.assign(
  {},
  require('./default'),
  require(`./${ENVIRONMENT.toLowerCase()}`)
);
