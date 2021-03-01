import * as fs from 'fs';

import debug from 'debug';

import { ProcessError } from '../errors';

import { getWorkSpace } from './common';

const debugUnipacker = debug('clean');

export async function cleanWorkspace(): Promise<void> {
  try {
    const workspakce = getWorkSpace();

    debugUnipacker('cleaning up the workspace %s', workspakce);

    fs.rmdirSync(workspakce, { recursive: true });
  } catch (error) {
    throw new ProcessError(error.message);
  }
}
