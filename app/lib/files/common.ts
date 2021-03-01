import * as os from 'os';
import * as path from 'path';

export function getWorkSpace(): string {
  return path.join(os.tmpdir(), 'restful4up');
}
