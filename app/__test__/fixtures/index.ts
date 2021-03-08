import * as fs from 'fs';
import * as path from 'path';

export function getPackedExec(): fs.ReadStream {
  return fs.createReadStream(path.join(__dirname, 'packed_file.inactive'));
}

export function getUnPackedExec(): Buffer {
  return fs.readFileSync(path.join(__dirname, 'unpacked_packed_file.inactive'));
}
