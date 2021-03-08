import { Request, Response, NextFunction } from 'express';

import { getEmulationOutput } from '../files';

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
