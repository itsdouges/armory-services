// @flow

import path from 'path';
import { addPath } from 'app-module-path';

addPath(path.join(__dirname, './'));

export { db, models, sync } from 'lib/db';
