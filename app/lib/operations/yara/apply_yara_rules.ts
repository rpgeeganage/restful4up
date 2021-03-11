import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

import debug from 'debug';

import {
  ISavedFile,
  getWorkSpace,
  saveIncommingFile,
  executeShellCommand
} from '../common';

import { getInputBuffer } from './common';

const debugApplyYaraRules = debug('apply-yara-rules');

/**
 * Apply YARA rule request
 *
 * @export
 * @interface IApplyYaraRulesRequest
 */
export interface IApplyYaraRulesRequest {
  file: Buffer;
  rules: string[];
  isUnpackingRequired?: boolean;
}

/**
 * Single YARA rule which applied
 *
 * @export
 * @interface ISingleYARARule
 */
export interface ISingleYARARule {
  rule: string;
  string_information: string[];
  [key: string]: string | string[];
}

/**
 * Apply YARA rule response
 *
 * @export
 * @interface IApplyYaraRulesRepsonse
 */
export interface IApplyYaraRulesRepsonse {
  matched_yara_rules?: ISingleYARARule[];
  error_message?: string;
  yara_command: string;
  is_success: boolean;
}

/**
 * Apply YARA rule operation
 *
 * @export
 * @param {IApplyYaraRulesRequest} request
 * @return {*}  {Promise<IApplyYaraRulesRepsonse>}
 */
export async function applyYaraRules(
  request: IApplyYaraRulesRequest
): Promise<IApplyYaraRulesRepsonse> {
  const yaraWorkspace = getWorkSpace(`${Date.now()}_yara_workspace`);
  const yaraRuleLocation = path.join(yaraWorkspace, 'rules');

  debugApplyYaraRules('Yara work space %s', yaraWorkspace);
  debugApplyYaraRules('Yara rule location %s', yaraRuleLocation);

  const incommingFile = await getInputBuffer(
    request.file,
    request.isUnpackingRequired
  );
  const executableFile = await saveIncommingFile(incommingFile, yaraWorkspace);

  fs.mkdirSync(yaraRuleLocation);

  const fileNames = generateRuleFiles(request.rules, yaraRuleLocation);
  const yaraCommand = getYaraCommand(fileNames, executableFile);

  debugApplyYaraRules('Yara command %s', yaraCommand);

  try {
    const results = await executeShellCommand(yaraCommand);

    return {
      matched_yara_rules: extractYaraResults(results, executableFile),
      yara_command: yaraCommand,
      is_success: true
    };
  } catch (error) {
    return {
      error_message: error.message,
      yara_command: yaraCommand,
      is_success: false
    };
  }
}

/**
 * Generate Rule files
 *
 * @param {string[]} encodedRules
 * @param {string} yaraRuleLocation
 * @return {*}
 */
function generateRuleFiles(encodedRules: string[], yaraRuleLocation: string) {
  return encodedRules.map((rule) => {
    const yaraRuleFilePath = path.join(
      yaraRuleLocation,
      crypto.randomBytes(24).toString('hex')
    );
    const yaraRuleContent = Buffer.from(rule, 'base64').toString('utf8');

    fs.writeFileSync(yaraRuleFilePath, Buffer.from(yaraRuleContent));

    debugApplyYaraRules('Yara rule location %s', yaraRuleFilePath);
    debugApplyYaraRules('Yara rule content %s', yaraRuleContent);

    return yaraRuleFilePath;
  });
}

/**
 * Build YARA command
 *
 * @param {string[]} fileNames
 * @param {ISavedFile} executableFile
 * @return {*}  {string}
 */
function getYaraCommand(
  fileNames: string[],
  executableFile: ISavedFile
): string {
  const { folder, file } = executableFile;
  const yaraCommand = `yara --print-strings --print-string-length --fail-on-warnings ${fileNames.join(
    ' '
  )} ${path.join(folder, file)}`;

  debugApplyYaraRules('Yara command %s', yaraCommand);

  return yaraCommand;
}

/**
 * Extract Yara Rules Mapping
 *
 * @param {string} yaraOutput
 * @param {ISavedFile} executableFilePath
 * @return {*}  {ISingleYARARule[]}
 */
function extractYaraResults(
  yaraOutput: string,
  executableFilePath: ISavedFile
): ISingleYARARule[] {
  const { folder, file } = executableFilePath;

  const outputLines = yaraOutput
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length);
  const pathRegEx = new RegExp(`${path.join(folder, file)}$`);
  const ruleIndexes = outputLines.reduce(
    (acc: number[], outline: string, index: number) => {
      if (pathRegEx.test(outline)) {
        acc.push(index);
      }

      return acc;
    },
    []
  );

  return buildRules(ruleIndexes, outputLines);
}

/**
 * Build YARA rule
 *
 * @param {number[]} ruleIndexes
 * @param {string[]} output
 * @return {*}
 */
function buildRules(ruleIndexes: number[], output: string[]) {
  return ruleIndexes.map((v, i: number) => {
    return {
      rule: output[v].split(/\s/, 2)[0],
      string_information: Number.isNaN(ruleIndexes[i + 1] - 1)
        ? output.slice(v + 1)
        : output.slice(v + 1, ruleIndexes[i + 1])
    };
  });
}
