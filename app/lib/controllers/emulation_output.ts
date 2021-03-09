import { Request, Response, NextFunction } from 'express';
import debug from 'debug';

import { getEmulationOutput } from '../files';

const debugUnipacker = debug('emulationOutput-Controller');

/**
 * Extract Emulation output request handler
 *
 * @export
 * @param {(Request & { files: { buffer: Buffer }[] })} req
 * @param {Response} res
 * @param {NextFunction} next
 * @return {*}  {Promise<void>}
 */
export async function emulationOutput(
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

    const output = await getEmulationOutput(file.buffer);

    res.json({
      output
    });
    next();
  } catch (error: unknown) {
    next(error);
  }
}
