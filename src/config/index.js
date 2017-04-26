// @flow

import _ from 'lodash';
import defaultConfig from './default';

const environment = (process.env.ENV || 'dev').toLowerCase();
const validEnvironments = ['dev', 'prod', 'test', 'local'];

if (validEnvironments.indexOf(environment) === -1) {
  throw new Error(`${environment} is not a supported environment!`);
}

console.log();
console.log(`>>> Running ${environment}`);
console.log();

const environmentConfig = require(`./${environment}`).default;

export default _.merge({},
  defaultConfig,
  environmentConfig, {
    environment,
  },
);
