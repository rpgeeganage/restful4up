import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { Readable } from 'stream';

import debug from 'debug';

import { ProcessError } from '../errors';

import { getWorkSpace } from './common';

interface ISavedFile {
  file: string;
  folder: string;
}

const debugUnipacker = debug('unipacker');

export async function getUnpackedFile(
  incommingFile: Buffer
): Promise<Readable> {
  try {
    const savedFileInfo = await saveIncommingFile(incommingFile);

    const readableStream = await getUnipackedFile(savedFileInfo);

    return readableStream;
  } catch (error) {
    throw new ProcessError(error.message);
  }
}

function saveIncommingFile(incommingFile: Buffer): Promise<ISavedFile> {
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

        debugUnipacker('saved path %s', savedPath);

        fs.writeFileSync(savedPath, incommingFile);

        resolve({
          file,
          folder
        });
      }
    );
  });
}

function getUnipackedFile(params: ISavedFile): Promise<Readable> {
  const { folder, file } = params;

  return new Promise((resolve, reject) => {
    const unipackerCommand = `unipacker ${path.join(
      folder,
      file
    )} -d ${folder}`;

    debugUnipacker('unipack command [%s]', unipackerCommand);

    exec(
      unipackerCommand,
      (error: Error | null, stdOut: string, stdErr: string) => {
        if (error) {
          debugUnipacker('Error occured %o', error);

          return reject(error);
        }
        if (stdErr) {
          debugUnipacker('Std Error occured %s', error);

          return reject(new Error(stdErr));
        }

        debugUnipacker('Std op occured %s', stdOut);

        try {
          const unipackerOutputFile = path.join(folder, `unpacked_${file}`);

          debugUnipacker('Unipacker output file %s', unipackerOutputFile);

          const readableStream = fs.createReadStream(unipackerOutputFile);

          return resolve(readableStream);
        } catch {
          return reject(new Error(stdOut));
        }
      }
    );
  });
}
