// @flow

import _ from 'lodash';
import SlackBot from 'slackbots';
import PromiseThrottle from 'promise-throttle';
import CircularJSON from 'circular-json';

import config from 'config';

const startBot = () => new Promise((resolve) => {
  const slackBot = new SlackBot({
    token: config.slack.token,
    name: `armorybot[${config.environment}]`,
  });

  slackBot.on('start', () => resolve(slackBot));
});

let bot;

const throttle = new PromiseThrottle({
  requestsPerSecond: 1,
  promiseImplementation: Promise,
});

function humanifyError (error = {}): string {
  try {
    if (error.status) {
      // eslint-disable-next-line max-len
      return `:fire::fire: [${error.status} ${error.statusText}] - ${_.get(error, 'data.text')}
[${_.get(error, 'config.method')}] ${_.get(error, 'config.url')}
${_.get(error, 'config.headers.Authorization')}`;
    }

    return `:fire::fire:
${CircularJSON.stringify(error)}`;
  } catch (err) {
    console.error(err);
    return 'Something bad happened';
  }
}

const createLog = (title: string, channel: string, privateChannel: boolean = true) => ({
  async log (message: string) {
    const messageWithTitle = `${title.toUpperCase()} - ${message}`;

    try {
      if (!bot) {
        bot = await startBot();
      }

      const postMessage = privateChannel
        ? bot.postMessageToGroup(channel, messageWithTitle)
        : bot.postMessageToChannel(channel, messageWithTitle);

      throttle.add(() => postMessage);
    } catch (e) {
      console.log();
      console.log('>>> Couldn\'t connect to slack (check api key)! Falling back to console.log()');
      console.log();
      console.log(messageWithTitle);
      console.log(JSON.stringify(e));
    }
  },

  async error (err: any) {
    await this.log(humanifyError(err));
  },

  catchLog (func: (any) => Promise<*>): (any) => Promise<*> {
    return async (...args) => {
      try {
        const result = await func(...args);
        return result;
      } catch (err) {
        this.error(err);
        throw err;
      }
    };
  },

  async start () {
    this.startTime = new Date();

    await this.log(':writing_hand:');
  },

  async finish (message: string) {
    if (!this.startTime) {
      throw new Error('Start first!');
    }

    await this.log(`:ok_hand:
${message}
Duration: ${(new Date() - this.startTime) / 1000 / 60}mins`);
  },
});

export default createLog;
