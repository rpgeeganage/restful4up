import { Request, Response, NextFunction } from 'express';

import { cleanWorkspace } from '../files';

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
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await cleanWorkspace();

    res.status(204).send();
    next();
  } catch (error: unknown) {
    next(error);
  }
}
