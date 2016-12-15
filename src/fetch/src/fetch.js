import Gitter from 'node-gitter';
import throat from 'throat';
import { allSettled } from './lib/promise';
import fetchTokens from './lib/tokens';
import config from '../config';

const gitter = new Gitter(config.gitter.apiKey);

async function sendToGitter (roomName, message) {
  try {
    const room = await gitter.rooms.join(`gw2armory/${roomName}`);
    room.send(message);
  } catch (e) {
    console.log('Couln\'t connect to gitter, check the api key. Falling back to console log.');
    console.log(message);
  }
}

const hr = '---------------------------------------------------';

async function logAndReturnResults (results, startTime) {
  const endTime = new Date();

  const flattenedResults = results.reduce((acc, result) => acc.concat(result.value), []);

  const errors = flattenedResults.filter(({ state }) => state === 'rejected');
  const successes = flattenedResults.filter(({ state }) => state === 'fulfilled');

  sendToGitter('fetch', `
\`\`\`
${hr}
FINISHED @ ${new Date().toString()}
${hr}

${hr}
LOGGED ERRORS
${hr}
${errors.map((error) => JSON.stringify(error.value)).join('\n')}
${hr}

${hr}
FETCH SUMMARY
${hr}
${errors.length} errors
${successes.length} success
Duration: ${(endTime - startTime) / 1000}s
${hr}
\`\`\`
  `);

  return {
    errors,
    successes,
  };
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

    sendToGitter('fetch', `
${hr}
  Starting fetch @ ${startTime.toString()}!
${hr}
`);

    const tokens = await fetchTokens(models);
    const results = await allSettled(tokens.map(throat(config.fetch.concurrentCalls, fetch)));

    return await logAndReturnResults(results, startTime);
  }

  return {
    batchFetch,
    fetch,
  };
}

module.exports = fetchFactory;
