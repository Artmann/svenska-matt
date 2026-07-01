const named: Record<string, string> = {
  amp: '&',
  nbsp: ' ',
  deg: '°',
  frac12: '½',
  frac13: '⅓',
  frac23: '⅔',
  frac14: '¼',
  frac34: '¾',
  frac15: '⅕',
  frac25: '⅖',
  frac35: '⅗',
  frac45: '⅘',
  frac16: '⅙',
  frac56: '⅚',
  frac18: '⅛',
  frac38: '⅜',
  frac58: '⅝',
  frac78: '⅞',
  frac17: '⅐',
  frac19: '⅑',
  frac110: '⅒'
}

// Some recipe feeds embed HTML entities (e.g. "&frac18;" or "&amp;") in their
// structured data instead of the decoded characters.
export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number(code))
    )
    .replace(/&(\w+);/g, (match, name: string) => named[name] ?? match)
}
