import debug from 'debug';

import { ProcessError } from '../../errors';

import {
  calculateHashes,
  saveIncommingFile,
  runStringExtraction
} from '../common';

import { getInputBuffer } from './common';
import { IYaraRule, generateRule } from './yara_rules';

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
