import { convertMeasurements } from '../conversion/measurements'

// Whole comma-segments that translate as a set phrase.
const phrases: Record<string, string> = {
  'at room temperature': 'rumstempererad',
  'for color and crunch': 'för färg och krisp',
  'for dipping': 'till doppning',
  'for drizzling': 'att ringla över',
  'for garnish': 'till garnering',
  'for serving': 'till servering',
  'for squeezing': 'att pressa',
  'or other flavoring': 'eller annan smaksättning',
  'plus more': 'plus mer',
  'room temperature': 'rumstempererad',
  'to taste': 'efter smak'
}

// Individual preparation words. Adjective agreement is approximate; these are
// parenthetical hints, not part of the ingredient name.
const words: Record<string, string> = {
  and: 'och',
  beaten: 'vispad',
  boiled: 'kokt',
  chilled: 'kyld',
  chopped: 'hackad',
  coarsely: 'grovt',
  cold: 'kall',
  cooked: 'kokt',
  cored: 'urkärnad',
  crumbled: 'smulad',
  crushed: 'krossad',
  cubed: 'tärnad',
  diced: 'tärnad',
  divided: 'delad',
  drained: 'avrunnen',
  finely: 'fint',
  fresh: 'färsk',
  frozen: 'fryst',
  grated: 'riven',
  halved: 'halverad',
  julienned: 'strimlad',
  lightly: 'lätt',
  mashed: 'mosad',
  melted: 'smält',
  minced: 'finhackad',
  optional: 'valfritt',
  or: 'eller',
  peeled: 'skalad',
  quartered: 'kvartad',
  rinsed: 'sköljd',
  roasted: 'rostad',
  roughly: 'grovt',
  seeded: 'urkärnad',
  shredded: 'strimlad',
  sifted: 'siktad',
  sliced: 'skivad',
  softened: 'mjuk',
  thinly: 'tunt',
  toasted: 'rostad',
  trimmed: 'putsad',
  warm: 'varm'
}

function translateSegment(segment: string): string {
  const converted = convertMeasurements(segment)
  const lower = converted.toLowerCase()

  if (phrases[lower]) {
    return phrases[lower]
  }

  const tokens = lower.split(/\s+/)

  if (tokens.every((token) => words[token] !== undefined)) {
    return tokens.map((token) => words[token]).join(' ')
  }

  return converted
}

export function translateNote(note: string): string {
  return note
    .split(',')
    .map((segment) => translateSegment(segment.trim()))
    .filter((segment) => segment !== '')
    .join(', ')
}
