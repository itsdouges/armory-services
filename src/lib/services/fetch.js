// @flow

import type { Models } from 'flowTypes';

import { models } from 'lib/db';
import moment from 'moment';
import { read, setValidity } from 'lib/services/tokens';
import config from 'config';
import axios from 'axios';

type Fetch = {
  id: number,
  token: string,
  permissions: string,
};

export function fetch ({ id, token, permissions }: Fetch) {
  return axios.post(`http://${config.fetch.host}:${config.fetch.port}/fetch`, {
    token,
    permissions,
    id,
  });
}

const fetchBlock = {};

export async function tryFetch (mdls: Models, id: number) {
  const token = await read(models, { id });
  const now = moment();
  const time = moment(token.updatedAt).add(config.fetch.refetchTimeout, 'ms');

  const canFetch = now.diff(time) >= 0;
  if (!fetchBlock[id] && canFetch) {
    fetchBlock[id] = true;
    await fetch({ id: token.id, permissions: token.permissions, token: token.token });
    delete fetchBlock[id];
    return;
  }

  return;
}

export async function setTokenValidity (promise: Promise<*>, apiToken: string) {
  try {
    const response = await promise;
    await setValidity(models, false, apiToken);
    return response;
  } catch (err) {
    const statusCode = err.response && err.response.status;
    if (statusCode < 500 && statusCode >= 400) {
      await setValidity(models, true, apiToken);
    }

    throw err;
  }
}
