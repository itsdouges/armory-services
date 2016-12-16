import Gitter from 'node-gitter';
import throat from 'throat';
import { allSettled } from './lib/promise';
import fetchTokens from './lib/tokens';
import config from '../config';

const gitter = new Gitter(config.gitter.apiKey);

function humanifyError (error) {
  return error.status
    ? (`
[${error.status} ${error.statusText}] - ${error.data.text}
[${error.config.method}] ${error.config.url}
${error.config.headers.Authorization}
`)
    : JSON.stingify(error);
}

async function sendToGitter (roomName, message) {
  try {
    const room = await gitter.rooms.join(`gw2armory/${roomName}`);
    room.send(`\`\`\`${message}\`\`\``);
  } catch (e) {
    console.log('Couldn\'t connect to gitter, check the api key. Falling back to console log.');
    console.log(message);
  }
}

const log = async (message) => await sendToGitter('fetch', message);

const hr = '---------------------------------------------------';

function parseResults (results) {
  const flattenedResults = results.reduce((acc, result) => acc.concat(result.value), []);
  const errors = flattenedResults.filter(({ state }) => state === 'rejected');
  const successes = flattenedResults.filter(({ state }) => state === 'fulfilled');

  return {
    errors,
    successes,
  };
}

async function logResults (startTime, { errors = [], successes = [] }) {
  const endTime = new Date();

  await log(`
${hr}
FINISHED @ ${new Date().toString()}
${hr}
  `);

  await log(`
${hr}
LOGGED ERRORS
${hr}`);

  if (errors.length) {
    await Promise.all(errors.map((error) => log(humanifyError(error.value))));
  } else {
    await log('No errors!');
  }

  await log(`
${hr}
FETCH SUMMARY
${hr}
${errors.length} errors
${successes.length} success
Duration: ${(endTime - startTime) / 1000}s
${hr}
  `);
}

function fetchFactory (models, fetchers) {
  if (!fetchers || !fetchers.length) {
    throw new Error('\n=== No fetchers available! ===\n');
  }

  async function fetch (token) {
    return await allSettled(fetchers.map((fetcher) => fetcher(models, token)));
  }

  async function batchFetch () {
    const startTime = new Date();

    log(`
${hr}
STARTING @ ${startTime.toString()}!
${hr}
`);

    const tokens = await fetchTokens(models);
    const results = await allSettled(tokens.map(throat(config.fetch.concurrentCalls, fetch)));

    const parsedResults = parseResults(results);

    logResults(startTime, parsedResults);

    return parsedResults;
  }

  return {
    batchFetch,
    fetch,
  };
}

module.exports = fetchFactory;
