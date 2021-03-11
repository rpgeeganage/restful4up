import { Readable } from 'stream';
import * as path from 'path';
import * as fs from 'fs';

import debug from 'debug';

import { ProcessError } from '../../errors';

import { saveIncommingFile, runUnipacker, ISavedFile } from '../common';

const debugUnipacker = debug('unipacker-unpack');

/**
 * Execute Unipacker and read the unpacked file operation handler
 *
 * @export
 * @param {Buffer} incommingFile
 * @return {*}  {Promise<Readable>}
 */
export async function getUnpackedFile(
  incommingFile: Buffer
): Promise<Readable> {
  try {
    const savedFileInfo = await saveIncommingFile(incommingFile);
    debugUnipacker('getUnpackedFile: saved file info %o', savedFileInfo);

    const stdOut = await runUnipacker(savedFileInfo);
    debugUnipacker('getUnpackedFile: executed unipacker');

    const readableStream = readUnpackedFile(savedFileInfo, stdOut);
    debugUnipacker('getUnpackedFile: readable stream success');

    return readableStream;
  } catch (error) {
    throw new ProcessError(error.message);
  }
}

/**
 * Get emulation output from Unipacker operation handler
 *
 * @export
 * @param {Buffer} incommingFile
 * @return {*}  {Promise<string[]>}
 */
export async function getEmulationOutput(
  incommingFile: Buffer
): Promise<string[]> {
  try {
    const savedFileInfo = await saveIncommingFile(incommingFile);
    debugUnipacker('getEmulationOutput: saved file info %o', savedFileInfo);

    const stdOut = await runUnipacker(savedFileInfo);
    debugUnipacker('getEmulationOutput: executed unipacker');

    return stdOut.split('\n').filter((s: string) => s && s.trim());
  } catch (error) {
    throw new ProcessError(error.message);
  }
}

/**
 * Read the unpacked file
 *
 * @param {ISavedFile} params
 * @param {string} stdOut
 * @return {*}  {Readable}
 */
function readUnpackedFile(params: ISavedFile, stdOut: string): Readable {
  const { folder, file } = params;
  try {
    const unipackerOutputFile = path.join(folder, `unpacked_${file}`);

    debugUnipacker(
      'readUnpackedFile: Unipacker output file %s',
      unipackerOutputFile
    );

    return fs.createReadStream(unipackerOutputFile);
  } catch {
    throw new ProcessError(stdOut);
  }
}
