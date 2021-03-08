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

export function generateRule(
  name: string,
  stringsToIgnore: string[],
  hashes: IHashes,
  extractedString: string[]
): IYaraRule {
  const hashString: [string, string][] = Object.keys(hashes).map((h) => [
    h,
    (hashes as IHashes & { [key: string]: string })[h]
  ]);

  const strings: [string, string][] = extractedString
    .filter(
      (es: string) =>
        es && es.trim() && es.length && !stringsToIgnore.includes(es)
    )
    .map((es: string, i: number) => [`str_${i}`, es.trim()]);

  return {
    name: `rule_for_${name}`,
    meta: [['date', new Date().toString()], ...hashString],
    strings
  };
}
