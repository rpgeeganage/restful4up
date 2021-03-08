import { Readable } from 'stream';

import debug from 'debug';

import { ProcessError } from '../errors';

import {
  saveIncommingFile,
  runStrings,
  ISavedFile,
  calculateSingleHash
} from './common';
import { getUnpackedFile } from './unpack';
import { IYaraRule, IHashes, generateRule } from './yara_rules';

const debugYara = debug('yara');

const DEFAULT_MINIMUM_STRING_LENGTH = 4;

export interface IGenerateYaraRules {
  file: Buffer;
  isUnpackingRequired: boolean;
  stringsToIgnore: string[];
  minimumStringLength: number;
}

export async function generateYaraRule(
  request: IGenerateYaraRules
): Promise<IYaraRule> {
  try {
    const incommingFile = await getInputBuffer(
      request.file,
      request.isUnpackingRequired
    );
    debugYara('generateYaraRule: buffer recieved');

    const savedFileInfo = await saveIncommingFile(incommingFile);
    debugYara('generateYaraRule: saved file info %j', savedFileInfo);

    const hashes = await calculateHashes(savedFileInfo);
    debugYara('generateYaraRule: hashes %j', hashes);

    const extractedStrings = await runStrings(
      savedFileInfo,
      request.minimumStringLength ?? DEFAULT_MINIMUM_STRING_LENGTH
    );
    debugYara('generateYaraRule: extracted strings %j', extractedStrings);

    const ruleName = 'extracted_string';
    const rule = generateRule(
      ruleName,
      request.stringsToIgnore,
      hashes,
      extractedStrings
    );
    debugYara('generateYaraRule: built rules %j', rule);

    return rule;
  } catch (error) {
    throw new ProcessError(error.message);
  }
}

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
