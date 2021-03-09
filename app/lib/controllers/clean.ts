import { Request, Response, NextFunction } from 'express';
import debug from 'debug';

import { cleanWorkspace } from '../files';

const debugUnipacker = debug('clean-controller');

/**
 * Clean request handler
 *
 * @export
 * @param {Request} _req
 * @param {Response} res
 * @param {NextFunction} next
 * @return {*}  {Promise<void>}
 */
export async function clean(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    debugUnipacker('URL :%s', req.url);

    await cleanWorkspace();

    res.status(204).send();
    next();
  } catch (error: unknown) {
    next(error);
  }
}
