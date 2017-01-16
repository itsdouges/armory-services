// @flow

import Gitter from 'node-gitter';
import _ from 'lodash';
import config from 'config';

const gitter = new Gitter(config.gitter.apiKey);

const hr = '---------------------------------------------------';

export function parseResults (results: []) {
  const errors = results.filter(({ state }) => state === 'rejected');
  const successes = results.filter(({ state }) => state === 'fulfilled');

  return {
    errors,
    successes,
  };
}

function humanifyError (error = {}): string {
  try {
    return error.status
      ? (`
[${error.status} ${error.statusText}] - ${_.get(error, 'data.text')}
[${_.get(error, 'config.method')}] ${_.get(error, 'config.url')}
${_.get(error, 'config.headers.Authorization')}
`)
    : JSON.stringify(error);
  } catch (e) {
    console.log(JSON.stringify(e));
    return 'Something bad happened';
  }
}

type LogOptions = {
  roomName: string,
};

const createLog = (title: string, { roomName = 'fetch' }: LogOptions = {}) => ({
  async log (message: string) {
    try {
      const room = await gitter.rooms.join(`gw2armory/${roomName}`);
      room.send(`\`\`\`${message}\`\`\``);
    } catch (e) {
      console.log('Couldn\'t connect to gitter, check the api key. Falling back to console log.');
      console.log(message);
      console.log(JSON.stringify(e));
    }
  },

  async start () {
    this.startTime = new Date();

    await this.log(`
${hr}
${title.toUpperCase()} | Started @ ${this.startTime.toString()}!
${hr}
    `);
  },

  async finish (results: []) {
    if (!this.startTime) {
      throw new Error('Start first!');
    }

    const { errors, successes } = parseResults(results);

    const endTime = new Date();

    await this.log(`
${hr}
${title.toUpperCase()} | Finished @ ${endTime.toString()}
${hr}
  `);

    await this.log(`
${hr}
${title.toUpperCase()} Errors
${hr}`);

    if (errors.length) {
      await Promise.all(errors.map((error) => this.log(humanifyError(error.value))));
    } else {
      await this.log('No errors!');
    }

    await this.log(`
${hr}
${title.toUpperCase()} | Summary
${hr}
${errors.length} errors
${successes.length} success
Duration: ${(endTime - this.startTime) / 1000 / 60}mins
${hr}
  `);
  },
});

export default createLog;
