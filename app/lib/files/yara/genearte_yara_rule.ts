import { Readable } from 'stream';

import debug from 'debug';

import { ProcessError } from '../../errors';

import {
  saveIncommingFile,
  runStringExtraction,
  ISavedFile,
  calculateSingleHash
} from '../common';
import { getUnpackedFile } from '../unpack';
import { IYaraRule, IHashes, generateRule } from './yara_rules';

const debugYara = debug('yara');

const DEFAULT_MINIMUM_STRING_LENGTH = 4;

/**
 * Generate partial YARA rule request
 *
 * @export
 * @interface IGeneratePartialYaraRules
 */
export interface IGeneratePartialYaraRules {
  file: Buffer;
  isUnpackingRequired: boolean;
  stringsToIgnore: string[];
  minimumStringLength: number;
}

/**
 * Generate YARA rule operation handler
 *
 * @export
 * @param {IGeneratePartialYaraRules} request
 * @return {*}  {Promise<IYaraRule>}
 */
export async function generatePartialYaraRule(
  request: IGeneratePartialYaraRules
): Promise<IYaraRule> {
  try {
    const incommingFile = await getInputBuffer(
      request.file,
      request.isUnpackingRequired
    );
    debugYara('generatePartialYaraRule: buffer recieved');

    const savedFileInfo = await saveIncommingFile(incommingFile);
    debugYara('generatePartialYaraRule: saved file info %j', savedFileInfo);

    const hashes = await calculateHashes(savedFileInfo);
    debugYara('generatePartialYaraRule: hashes %j', hashes);

    const extractedStrings = await runStringExtraction(
      savedFileInfo,
      request.minimumStringLength ?? DEFAULT_MINIMUM_STRING_LENGTH
    );
    debugYara(
      'generatePartialYaraRule: extracted strings %j',
      extractedStrings
    );

    const ruleName = 'extracted_string';
    const rule = generateRule(
      ruleName,
      request.stringsToIgnore,
      hashes,
      extractedStrings
    );
    debugYara('generatePartialYaraRule: built rules %j', rule);

    return rule;
  } catch (error) {
    throw new ProcessError(error.message);
  }
}

/**
 * Unpack and convert stream to buffer if required
 *
 * @param {Buffer} inputBuffer
 * @param {boolean} [isUpackingRequired]
 * @return {*}  {Promise<Buffer>}
 */
async function getInputBuffer(
  inputBuffer: Buffer,
  isUpackingRequired?: boolean
): Promise<Buffer> {
  if (isUpackingRequired) {
    const readbleStream = await getUnpackedFile(inputBuffer);

    return getBufferFromStream(readbleStream);
  }

  return inputBuffer;
}

/**
 * Convert stream to buffer
 *
 * @param {Readable} inputStream
 * @return {*}  {Promise<Buffer>}
 */
async function getBufferFromStream(inputStream: Readable): Promise<Buffer> {
  debugYara('getBufferFromStream: converting a stream to buffer');

  const bufferChuncks: Buffer[] = [];

  for await (const s of inputStream) {
    bufferChuncks.push(s);
  }

  debugYara(
    'getBufferFromStream: created buffer chunks %s',
    bufferChuncks.length
  );

  return Buffer.concat(bufferChuncks);
}

/**
 * Get hashes
 *
 * @param {ISavedFile} savedFile
 * @return {*}  {Promise<IHashes>}
 */
async function calculateHashes(savedFile: ISavedFile): Promise<IHashes> {
  const [md5sum, sha256sum, sha512sum] = await Promise.all(
    ['md5sum', 'sha256sum', 'sha512sum'].map((h) =>
      calculateSingleHash(h, savedFile)
    )
  );

  return {
    md5sum,
    sha256sum,
    sha512sum
  };
}
