import { Request, Response, NextFunction } from 'express';
import debug from 'debug';

import { getUnpackedFile } from '../files';

const debugUnipacker = debug('unpack-Controller');

/**
 * Run Unipacker request handler
 *
 * @export
 * @param {(Request & { files: { buffer: Buffer }[] })} req
 * @param {Response} res
 * @param {NextFunction} next
 * @return {*}  {Promise<void>}
 */
export async function unpack(
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

    const readbleStream = await getUnpackedFile(file.buffer);

    readbleStream.pipe(res);
  } catch (error: unknown) {
    next(error);
  }
}
