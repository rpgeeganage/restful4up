import { IHashes } from '../common';

export interface IYaraRule {
  name: string;
  meta: { [key: string]: string };
  strings: [string, string][];
}

/**
 * Generate partial YARA Rule operation handler
 *
 * @export
 * @param {string} name
 * @param {string[]} stringsToIgnore
 * @param {IHashes} hashes
 * @param {[string, string][]} extractedString
 * @return {*}  {IYaraRule}
 */
export function generateRule(
  name: string,
  stringsToIgnore: string[],
  hashes: IHashes,
  extractedString: [string, string][]
): IYaraRule {
  const meta = {
    date: new Date().toString(),
    md5sum: hashes.md5sum,
    sha256sum: hashes.sha256sum,
    sha512sum: hashes.sha512sum
  };

  const strings: [string, string][] = extractedString
    .filter(
      (es: [string, string]) =>
        es[1] &&
        es[1].trim() &&
        es[1].length &&
        !stringsToIgnore.includes(es[1])
    )
    .map((es: [string, string], i: number) => [
      `${es[0]}_${i}`.toLowerCase(),
      es[1].trim()
    ]);

  return {
    name: `rule_for_${name}`,
    meta,
    strings
  };
}
