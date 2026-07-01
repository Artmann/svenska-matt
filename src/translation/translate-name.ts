import { dictionary } from './dictionary'

// Leading words that qualify an ingredient but are not part of its core name.
// They are only stripped when the full phrase is not itself a dictionary entry,
// so "sweet potato" or "red onion" still win as whole phrases.
const descriptors = new Set([
  'active',
  'baby',
  'bag',
  'beaten',
  'black',
  'boiled',
  'boneless',
  'bottle',
  'box',
  'brandied',
  'bunch',
  'can',
  'canned',
  'carton',
  'caster',
  'chilled',
  'chopped',
  'clove',
  'coarsely',
  'cold',
  'confectioners',
  'container',
  'cooked',
  'cored',
  'crumbled',
  'crushed',
  'cubed',
  'cut',
  'dark',
  'dash',
  'deep',
  'deveined',
  'diced',
  'dish',
  'drained',
  'dried',
  'drop',
  'dry',
  'ear',
  'extra',
  'fat',
  'fine',
  'finely',
  'free',
  'fresh',
  'freshly',
  'frozen',
  'granulated',
  'grated',
  'green',
  'ground',
  'halved',
  'head',
  'instant',
  'jar',
  'julienned',
  'kosher',
  'large',
  'lean',
  'less',
  'light',
  'lightly',
  'loosely',
  'low',
  'mashed',
  'medium',
  'melted',
  'minced',
  'organic',
  'package',
  'packed',
  'peeled',
  'pinch',
  'pitted',
  'pkg',
  'plain',
  'quartered',
  'raw',
  'red',
  'reduced',
  'rinsed',
  'ripe',
  'roasted',
  'roughly',
  'salted',
  'scrambled',
  'sea',
  'seeded',
  'shredded',
  'sifted',
  'slice',
  'sliced',
  'small',
  'smoked',
  'sodium',
  'softened',
  'sprig',
  'stalk',
  'steamed',
  'stemmed',
  'superfine',
  'sweet',
  'thick',
  'thickly',
  'thin',
  'thinly',
  'toasted',
  'trimmed',
  'unsalted',
  'virgin',
  'warm',
  'white',
  'whole',
  'yellow'
])

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-.,;:!?()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const irregularPlurals: Record<string, string> = {
  halves: 'half',
  knives: 'knife',
  leaves: 'leaf',
  loaves: 'loaf'
}

function singularizeWord(word: string): string {
  if (irregularPlurals[word] !== undefined) {
    return irregularPlurals[word]
  }

  if (word.length <= 3) {
    return word
  }

  if (word.endsWith('ies')) {
    return `${word.slice(0, -3)}y`
  }

  if (word.endsWith('oes')) {
    return word.slice(0, -2)
  }

  if (/(?:s|x|z|ch|sh)es$/.test(word)) {
    return word.slice(0, -2)
  }

  if (word.endsWith('ss')) {
    return word
  }

  if (word.endsWith('s')) {
    return word.slice(0, -1)
  }

  return word
}

function singularizePhrase(phrase: string): string {
  const words = phrase.split(' ')
  const last = words.length - 1

  words[last] = singularizeWord(words[last])

  return words.join(' ')
}

const connectors = new Set(['and', 'or', '&', 'plus', 'with'])

function isDescriptor(word: string): boolean {
  return descriptors.has(word) || descriptors.has(singularizeWord(word))
}

function searchFromFront(words: string[]): string | null {
  let remaining = words

  while (remaining.length > 0) {
    const phrase = remaining.join(' ')

    for (const candidate of [phrase, singularizePhrase(phrase)]) {
      const match = dictionary[candidate]

      if (match) {
        return match
      }
    }

    if (!isDescriptor(remaining[0])) {
      return null
    }

    remaining = remaining.slice(1)
  }

  return null
}

function trimTrailing(words: string[]): string[] {
  let remaining = words

  while (
    remaining.length > 1 &&
    (isDescriptor(remaining[remaining.length - 1]) ||
      connectors.has(remaining[remaining.length - 1]))
  ) {
    remaining = remaining.slice(0, -1)
  }

  return remaining
}

function lookup(words: string[]): string | null {
  const direct = searchFromFront(words)

  if (direct !== null) {
    return direct
  }

  // Only drop trailing descriptors/connectors ("frozen and grated") when the
  // untrimmed name did not match, so phrases like "egg whites" stay intact.
  const trimmed = trimTrailing(words)

  return trimmed.length === words.length ? null : searchFromFront(trimmed)
}

// Translates "salt and pepper" style names by translating each side, but only
// when every part is a known ingredient, so compound names are left intact.
function translateConjunction(normalized: string): string | null {
  const parts = normalized.split(/\s+(and|or)\s+/)

  if (parts.length < 3) {
    return null
  }

  const rendered: string[] = []

  for (let index = 0; index < parts.length; index += 1) {
    if (index % 2 === 1) {
      rendered.push(parts[index] === 'or' ? 'eller' : 'och')

      continue
    }

    const translated = lookup(parts[index].split(' '))

    if (translated === null) {
      return null
    }

    rendered.push(translated)
  }

  return rendered.join(' ')
}

export function translateName(name: string): string {
  const normalized = normalize(name)

  if (normalized === '') {
    return normalized
  }

  return (
    lookup(normalized.split(' ')) ??
    translateConjunction(normalized) ??
    normalized
  )
}
