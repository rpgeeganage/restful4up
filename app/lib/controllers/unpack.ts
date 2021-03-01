import { Request, Response, NextFunction } from 'express';

import { getUnpackedFile } from '../files';

export async function unpack(
  req: Request & { files: { buffer: Buffer }[] },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.files.pop() as { buffer: Buffer };

    const readbleStream = await getUnpackedFile(file.buffer);

    readbleStream.pipe(res);
  } catch (error: unknown) {
    next(error);
  }
}
