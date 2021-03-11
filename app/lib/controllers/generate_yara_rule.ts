import { Request, Response, NextFunction } from 'express';
import debug from 'debug';

import { generatePartialYaraRule as generatePartialYaraRuleOperation } from '../operations';

const debugUnipacker = debug('emulationOutput-Controller');

/**
 * Generate Yara partial Yara rules for given executable request handler
 *
 * @export
 * @param {(Request & { files: { buffer: Buffer }[] })} req
 * @param {Response} res
 * @param {NextFunction} next
 * @return {*}  {Promise<void>}
 */
export async function generatePartialYaraRule(
  req: Request & { files: { buffer: Buffer }[] },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    debugUnipacker(
      'request body %j. files count %s',
      req.body,
      req.files.length
    );

    const file = req.files.pop() as { buffer: Buffer };
    const {
      is_unpacking_required,
      minimum_string_length,
      strings_to_ignore
    } = req.body;

    const rule = await generatePartialYaraRuleOperation({
      file: file.buffer,
      isUnpackingRequired: !!is_unpacking_required,
      minimumStringLength: parseInt(minimum_string_length, 10),
      stringsToIgnore: strings_to_ignore ?? []
    });

    res.json({
      rule
    });

    next();
  } catch (error: unknown) {
    next(error);
  }
}
