import { Request, Response, NextFunction } from 'express';
import debug from 'debug';

import { applyYaraRules as applyYaraRulesOperation } from '../operations';

const debugUnipacker = debug('applyYaraRules-Controller');

/**
 * Apply YARA rules output request handler
 *
 * @export
 * @param {(Request & { files: { buffer: Buffer }[] })} req
 * @param {Response} res
 * @param {NextFunction} next
 * @return {*}  {Promise<void>}
 */
export async function applyYaraRules(
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
    const { is_unpacking_required, rules } = req.body;

    const output = await applyYaraRulesOperation({
      file: file.buffer,
      isUnpackingRequired: !!is_unpacking_required,
      rules
    });

    res.json({
      output
    });
    next();
  } catch (error: unknown) {
    next(error);
  }
}
