import { Request, Response, NextFunction } from 'express';

import { generateYaraRule as generateYaraRuleOperation } from '../files';

export async function generateYaraRule(
  req: Request & { files: { buffer: Buffer }[] },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.files.pop() as { buffer: Buffer };
    const {
      is_unpacking_required,
      minimum_string_length,
      strings_to_ignore
    } = req.body;

    const rule = await generateYaraRuleOperation({
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
