import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

import debug from 'debug';

const debugCommon = debug('common');
/**
 * Saved file return type
 *
 * @export
 * @interface ISavedFile
 */
export interface ISavedFile {
  file: string;
  folder: string;
}

/**
 * Create workspace and returns it
 *
 * @export
 * @return {*}  {string}
 */
export function getWorkSpace(): string {
  return path.join(os.tmpdir(), 'restful4up');
}

/**
 * Save incoming file
 *
 * @export
 * @param {Buffer} incommingFile
 * @return {*}  {Promise<ISavedFile>}
 */
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

/**
 * Running Unipacker
 *
 * @export
 * @param {ISavedFile} params
 * @return {*}  {Promise<string>}
 */
export function runUnipacker(params: ISavedFile): Promise<string> {
  debugCommon('runUnipackedFile: executing command');

  const { folder, file } = params;

  const inputFilePath = path.join(folder, file);
  const command = `unipacker ${inputFilePath} -d ${folder}`;

  return executeShellCommand(command);
}

/**
 * Running string extraction command
 *
 * @export
 * @param {ISavedFile} params
 * @param {number} mininumLengthOfString
 * @return {*}  {Promise<[string, string][]>}
 */
export async function runStringExtraction(
  params: ISavedFile,
  mininumLengthOfString: number
): Promise<[string, string][]> {
  debugCommon('runStringExtraction: executing command');

  const { folder, file } = params;

  const inputFilePath = path.join(folder, file);
  const command = `pestr -s -n ${mininumLengthOfString} ${inputFilePath}`;
  const output = await executeShellCommand(command);

  const multilines = output.split(/\n/);

  return multilines.map((l): [string, string] => {
    const parts = l.split(/\t/, 2);
    const section = parts[0].replace(/[\W-]/g, '');

    return [section, parts[1]] as [string, string];
  });
}

/**
 * Calculating a single hash
 *
 * @export
 * @param {string} hashCommand
 * @param {ISavedFile} params
 * @return {*}  {Promise<string>}
 */
export async function calculateSingleHash(
  hashCommand: string,
  params: ISavedFile
): Promise<string> {
  debugCommon('calculateSingleHash: executing command');

  const { folder, file } = params;

  const inputFilePath = path.join(folder, file);
  const command = `${hashCommand} ${inputFilePath}`;
  const output = await executeShellCommand(command);

  return output.split(/\s/)[0] as string;
}

/**
 * Execute shell command
 *
 * @param {string} command
 * @return {*}  {Promise<string>}
 */
function executeShellCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    debugCommon('executeShellCommand: [%s]', command);

    exec(command, (error: Error | null, stdOut: string, stdErr: string) => {
      if (error) {
        debugCommon('executeShellCommand: Error occured %o', error);

        return reject(error);
      }

      if (stdErr) {
        debugCommon('executeShellCommand: Std Error occured %s', error);

        return reject(new Error(stdErr));
      }

      debugCommon('executeShellCommand: stdOut %s', stdOut);

      return resolve(stdOut);
    });
  });
}
