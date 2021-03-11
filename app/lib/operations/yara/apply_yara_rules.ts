import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

import debug from 'debug';

import {
  getWorkSpace,
  saveIncommingFile,
  executeShellCommand
} from '../common';

const debugApplyYaraRules = debug('apply-yara-rules');

export interface IApplyYaraRulesRequest {
  file: Buffer;
  rules: string[];
  isUnpackingRequired?: boolean;
}

export interface IApplyYaraRulesRepsonse {
  emulation_output?: string[];
  yara_rule_results?: string[];
  error_message?: string;
  yara_command: string;
  is_success: boolean;
}

export async function applyYaraRules(
  request: IApplyYaraRulesRequest
): Promise<IApplyYaraRulesRepsonse> {
  const yaraWorkspace = getWorkSpace(`${Date.now()}_yara_workspace`);
  const yaraRuleLocation = path.join(yaraWorkspace, 'rules');

  debugApplyYaraRules('Yara work space %s', yaraWorkspace);
  debugApplyYaraRules('Yara rule location %s', yaraRuleLocation);

  const { folder, file } = await saveIncommingFile(request.file, yaraWorkspace);

  fs.mkdirSync(yaraRuleLocation);

  const fileNames = request.rules.map((rule) => {
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

  const yaraCommand = `yara --fail-on-warnings ${fileNames.join(
    ' '
  )} ${path.join(folder, file)}`;

  debugApplyYaraRules('Yara command %s', yaraCommand);

  try {
    const results = await executeShellCommand(yaraCommand);
    return {
      yara_rule_results: results.trim().split('\n'),
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
