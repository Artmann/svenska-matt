import { decodeEntities } from './parsing/decode-entities'
import { parseIngredient } from './parsing/parse-ingredient'
import { isKnownIngredient } from './translation/translate-name'

const capitalized = /^[A-ZÅÄÖ]/

// A short, mostly-capitalized line with no numbers reads like a section title
// ("Pastry Crust", "Strawberry Topping") rather than an ingredient.
function isTitleLike(text: string): boolean {
  if (/\d/.test(text) || text.includes(',')) {
    return false
  }

  const words = text.split(/\s+/).filter((word) => word !== '')

  if (words.length === 0 || words.length > 5 || !capitalized.test(words[0])) {
    return false
  }

  const capitals = words.filter((word) => capitalized.test(word))

  return capitals.length >= Math.ceil(words.length / 2)
}

export function isSectionHeading(line: string): boolean {
  const parsed = parseIngredient(line)

  if (parsed.quantity !== null || parsed.unit !== null) {
    return false
  }

  if (isKnownIngredient(parsed.name)) {
    return false
  }

  const trimmed = decodeEntities(line).trim()

  return (
    trimmed.endsWith(':') || /^for\b/i.test(trimmed) || isTitleLike(trimmed)
  )
}

export function sectionHeadingText(line: string): string {
  return decodeEntities(line).trim()
}
