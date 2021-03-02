import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

import debug from 'debug';

const debugUnipacker = debug('unipacker-common');
export interface ISavedFile {
  file: string;
  folder: string;
}

export function getWorkSpace(): string {
  return path.join(os.tmpdir(), 'restful4up');
}

export function saveIncommingFile(incommingFile: Buffer): Promise<ISavedFile> {
  const workSpace = getWorkSpace();

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(workSpace)) {
      fs.mkdirSync(workSpace);
    }

    fs.mkdtemp(
      path.join(workSpace, 'app_'),
      (error: Error | null, folder: string) => {
        if (error) {
          return reject(error);
        }

        const file = `${Date.now()}.invactive`;
        const savedPath = path.join(folder, file);

        debugUnipacker('saveIncommingFile: saved path %s', savedPath);

        fs.writeFileSync(savedPath, incommingFile);

        resolve({
          file,
          folder
        });
      }
    );
  });
}

export function runUnipacker(params: ISavedFile): Promise<string> {
  const { folder, file } = params;

  return new Promise((resolve, reject) => {
    const unipackerCommand = `unipacker ${path.join(
      folder,
      file
    )} -d ${folder}`;

    debugUnipacker('runUnipackedFile: unipack command [%s]', unipackerCommand);

    exec(
      unipackerCommand,
      (error: Error | null, stdOut: string, stdErr: string) => {
        if (error) {
          debugUnipacker('runUnipackedFile: Error occured %o', error);

          return reject(error);
        }
        if (stdErr) {
          debugUnipacker('runUnipackedFile: Std Error occured %s', error);

          return reject(new Error(stdErr));
        }

        debugUnipacker('runUnipackedFile: Std op occured %s', stdOut);

        return resolve(stdOut);
      }
    );
  });
}
