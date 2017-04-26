// @flow

import _ from 'lodash';
import config from 'config';
import SlackBot from 'slackbots';
import PromiseThrottle from 'promise-throttle';

const startBot = () => new Promise((resolve) => {
  const slackBot = new SlackBot({
    token: config.slack.token,
    name: 'armorybot',
  });

  slackBot.on('start', () => resolve(slackBot));
});

let bot;

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
      ? (`:fire::fire: [${error.status} ${error.statusText}] - ${_.get(error, 'data.text')}
[${_.get(error, 'config.method')}] ${_.get(error, 'config.url')}
${_.get(error, 'config.headers.Authorization')}`)
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
      if (!bot) {
        bot = await startBot();
      }

      throttle.add(() => bot.postMessageToChannel(channel, message));
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

    await this.log(`${title.toUpperCase()} :writing_hand:`);
  },

  async finish (results: []) {
    if (!this.startTime) {
      throw new Error('Start first!');
    }

    const { errors, successes } = parseResults(results);

    if (errors.length) {
      await Promise.all(errors.map((error) => this.log(humanifyError(error.value))));
    }

    await this.log(`${title.toUpperCase()} :ok_hand:
${errors.length} errors
${successes.length} success
Duration: ${(new Date() - this.startTime) / 1000 / 60}mins`);
  },
});

export default createLog;
