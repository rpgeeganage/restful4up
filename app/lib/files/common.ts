import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

import debug from 'debug';

const debugCommon = debug('common');
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

        debugCommon('saveIncommingFile: saved path %s', savedPath);

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
    const flareFlossCommand = `unipacker ${path.join(
      folder,
      file
    )} -d ${folder}`;

    debugCommon('runUnipackedFile: unipack command [%s]', flareFlossCommand);

    exec(
      flareFlossCommand,
      (error: Error | null, stdOut: string, stdErr: string) => {
        if (error) {
          debugCommon('runUnipackedFile: Error occured %o', error);

          return reject(error);
        }

        if (stdErr) {
          debugCommon('runUnipackedFile: Std Error occured %s', error);

          return reject(new Error(stdErr));
        }

        debugCommon('runUnipackedFile: Std op occured %s', stdOut);

        return resolve(stdOut);
      }
    );
  });
}

export function runStrings(
  params: ISavedFile,
  mininumLengthOfString: number
): Promise<string[]> {
  const { folder, file } = params;

  return new Promise((resolve, reject) => {
    const inputFilePath = path.join(folder, file);

    const flareFlossCommand = `strings -n ${mininumLengthOfString} ${inputFilePath}`;

    debugCommon('runStrings: strings command [%s]', flareFlossCommand);

    exec(
      flareFlossCommand,
      (error: Error | null, stdOut: string, stdErr: string) => {
        if (error) {
          debugCommon('runStrings: Error occured %o', error);

          return reject(error);
        }

        if (stdErr) {
          debugCommon('runStrings: Std Error occured %s', error);

          return reject(new Error(stdErr));
        }

        debugCommon('runStrings: Std op occured %s', stdOut);

        return resolve(stdOut.split(/\n/));
      }
    );
  });
}

export function calculateSingleHash(
  hashCommand: string,
  params: ISavedFile
): Promise<string> {
  const { folder, file } = params;

  return new Promise((resolve, reject) => {
    const inputFilePath = path.join(folder, file);

    const singleHashComand = `${hashCommand} ${inputFilePath}`;

    debugCommon('calculateSingleHash: hash command [%s]', singleHashComand);

    exec(
      singleHashComand,
      (error: Error | null, stdOut: string, stdErr: string) => {
        if (error) {
          debugCommon('calculateSingleHash: Error occured %o', error);

          return reject(error);
        }

        if (stdErr) {
          debugCommon('calculateSingleHash: Std Error occured %s', error);

          return reject(new Error(stdErr));
        }

        debugCommon('calculateSingleHash: stdOut %s', stdOut);

        const output = stdOut.split(/\s/)[0] as string;

        return resolve(output);
      }
    );
  });
}
