import { Request, Response, NextFunction } from 'express';

import { cleanWorkspace } from '../files';

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
