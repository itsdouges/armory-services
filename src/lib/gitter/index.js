// @flow

import Gitter from 'node-gitter';
import config from 'config';

const gitter = new Gitter(config.gitter.apiKey);

const createLog = (roomName: string) => async (message: string) => {
  try {
    const room = await gitter.rooms.join(`gw2armory/${roomName}`);
    room.send(`\`\`\`${message}\`\`\``);
  } catch (e) {
    console.log('Couldn\'t connect to gitter, check the api key. Falling back to console log.');
    console.log(message);
    console.log(JSON.stringify(e));
  }
};

export default createLog;
