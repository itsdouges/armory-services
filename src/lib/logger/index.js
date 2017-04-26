// @flow

import _ from 'lodash';
import config from 'config';
import SlackBot from 'slackbots';
import PromiseThrottle from 'promise-throttle';

const startBot = new Promise((resolve) => {
  const slackBot = new SlackBot({
    token: config.slack.token,
    name: 'armory-bot',
  });

  slackBot.on('start', () => resolve(slackBot));
});

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

const throttle = new PromiseThrottle({
  requestsPerSecond: 1,
  promiseImplementation: Promise,
});

const createLog = (title: string, channel: string) => ({
  async log (message: string) {
    try {
      const slackBot = await startBot;
      throttle(() => slackBot.postMessageToChannel(channel, message));
    } catch (e) {
      console.log();
      console.log('>>> Couldn\'t connect to slack (check api key)! Falling back to console.log()');
      console.log();
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
