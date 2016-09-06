const ENVIRONMENT = process.env.ENV || 'DEV';

switch (ENVIRONMENT) {
  case 'DEV':
  case 'PROD':
    break;

  default:
    throw new Error(`${ENVIRONMENT} is not a supported environment!`);
}

console.log(`\n== Running with ${ENVIRONMENT} settings. ==\n`);

module.exports = require(`./${ENVIRONMENT.toLowerCase()}`);
