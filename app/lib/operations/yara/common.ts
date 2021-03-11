import debug from 'debug';

import { getUnpackedFile } from '../unpacker';
import { getBufferFromStream } from '../common';

const debugYaraCommon = debug('yara-common');

/**
 * Unpack and convert stream to buffer if required
 *
 * @param {Buffer} inputBuffer
 * @param {boolean} [isUpackingRequired]
 * @return {*}  {Promise<Buffer>}
 */
export async function getInputBuffer(
  inputBuffer: Buffer,
  isUpackingRequired?: boolean
): Promise<Buffer> {
  debugYaraCommon('getInputBuffer: isUpackingRequired %s', isUpackingRequired);

  if (isUpackingRequired) {
    const readbleStream = await getUnpackedFile(inputBuffer);

    return getBufferFromStream(readbleStream);
  }

  return inputBuffer;
}
