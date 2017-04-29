// @flow

import _ from 'lodash';
import config from 'config';
import SlackBot from 'slackbots';
import PromiseThrottle from 'promise-throttle';

const startBot = () => new Promise((resolve) => {
  const slackBot = new SlackBot({
    token: config.slack.token,
    name: `armorybot[${config.environment}]`,
  });

  slackBot.on('start', () => resolve(slackBot));
});

let bot;

export function parseResults (results: []) {
  const errors = [];
  const successes = [];
  const removed = [];
  const permissions = [];

  results.forEach((result) => {
    if (result.state === 'fulfilled') {
      successes.push(result);
      return;
    }

    if (result.value.status === 400) {
      removed.push(result);
    } else if (result.value.status === 403) {
      permissions.push(result);
    } else {
      errors.push(result);
    }
  });

  return {
    errors,
    successes,
    removed,
    permissions,
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

    const { errors, successes, removed, permissions } = parseResults(results);

    if (errors.length) {
      await Promise.all(errors.map((error) => this.log(humanifyError(error.value))));
    }

    await this.log(`${title.toUpperCase()} :ok_hand:
${successes.length} succesful fetches
${errors.length} fetches errored
${removed.length} tokens were removed from arenanet
${permissions.length} fetches lacked permissions
Duration: ${(new Date() - this.startTime) / 1000 / 60}mins`);
  },
});

export default createLog;
