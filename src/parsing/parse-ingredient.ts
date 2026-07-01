import type { ParsedIngredient } from '../types'
import { normalizeUnit } from '../conversion/units'
import { decodeEntities } from './decode-entities'
import { parseQuantity } from './quantity'

function readUnit(text: string): { unit: string | null; rest: string } {
  const trimmed = text.replace(/^\s+/, '')

  if (trimmed === '') {
    return { unit: null, rest: '' }
  }

  const tokens = trimmed.split(/\s+/)
  const twoWord = tokens.length >= 2 ? `${tokens[0]} ${tokens[1]}` : null

  if (twoWord !== null && normalizeUnit(twoWord) !== null) {
    return { unit: twoWord, rest: tokens.slice(2).join(' ') }
  }

  if (normalizeUnit(tokens[0]) !== null) {
    return { unit: tokens[0], rest: tokens.slice(1).join(' ') }
  }

  return { unit: null, rest: trimmed }
}

// List markers and checkboxes some sites prepend to each ingredient line.
const leadingMarkers = /^[\s▢□☐✓✔•·◦▪▫▸►●○*·]+/

// A metric weight/volume annotation many recipes append as a second measurement,
// e.g. "213g" or "15mL". Removed from the ingredient name so it can translate.
const trailingMetricAnnotation =
  /\s+\d+(?:[.,]\d+)?\s?(?:g|kg|mg|ml|cl|dl|l|grams?|kilograms?|milliliters?|millilitres?|liters?|litres?)\.?$/i

// Preparation phrases that trail the ingredient name without a comma; moved to
// the note so the name itself can be translated.
const trailingPreparation =
  /\s+(at room temperature|room temperature|to taste)$/i

export function parseIngredient(line: string): ParsedIngredient {
  const collapsed = decodeEntities(line)
    .replace(leadingMarkers, '')
    .trim()
    .replace(/\s+/g, ' ')

  const parentheses = collapsed.match(/\(([^)]*)\)/)
  const parentheticalNote = parentheses ? parentheses[1].trim() : null
  const withoutParentheses = collapsed.replace(/\s*\([^)]*\)\s*/g, ' ').trim()

  const { quantity, rest } = parseQuantity(withoutParentheses)
  const { unit, rest: afterUnit } = readUnit(rest)

  const nameAndNote = afterUnit.replace(/^of\s+/i, '').trim()
  const commaIndex = nameAndNote.indexOf(',')
  const nameWithMetric = (
    commaIndex === -1 ? nameAndNote : nameAndNote.slice(0, commaIndex).trim()
  )
    .replace(trailingMetricAnnotation, '')
    .trim()
  const commaNote =
    commaIndex === -1 ? null : nameAndNote.slice(commaIndex + 1).trim()

  const prep = nameWithMetric.match(trailingPreparation)
  const name = prep
    ? nameWithMetric.slice(0, prep.index).trim()
    : nameWithMetric
  const prepNote = prep ? prep[1] : null

  const notes = [parentheticalNote, commaNote, prepNote].filter(
    (value): value is string => value !== null && value !== ''
  )
  const note = notes.length > 0 ? notes.join(', ') : null

  return { quantity, unit, name, note }
}
