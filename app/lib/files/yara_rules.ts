export interface IHashes {
  md5sum: string;
  sha256sum: string;
  sha512sum: string;
}

export interface IYaraRule {
  name: string;
  meta: [string, string][];
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
  const hashString: [string, string][] = Object.keys(hashes).map((h) => [
    h,
    (hashes as IHashes & { [key: string]: string })[h]
  ]);

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
    meta: [['date', new Date().toString()], ...hashString],
    strings
  };
}
