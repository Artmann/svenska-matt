import type { ParsedIngredient, Quantity } from '../types'

const fractionGlyphs: Array<{ value: number; glyph: string }> = [
  { value: 1 / 8, glyph: '⅛' },
  { value: 1 / 4, glyph: '¼' },
  { value: 1 / 3, glyph: '⅓' },
  { value: 3 / 8, glyph: '⅜' },
  { value: 1 / 2, glyph: '½' },
  { value: 5 / 8, glyph: '⅝' },
  { value: 2 / 3, glyph: '⅔' },
  { value: 3 / 4, glyph: '¾' },
  { value: 7 / 8, glyph: '⅞' }
]

export function formatNumber(value: number): string {
  const whole = Math.floor(value)
  const fraction = value - whole
  const glyph = fractionGlyphs.find(
    (candidate) => Math.abs(candidate.value - fraction) < 0.02
  )

  if (glyph) {
    return (whole > 0 ? String(whole) : '') + glyph.glyph
  }

  if (Number.isInteger(value)) {
    return String(value)
  }

  return Number(value.toFixed(2)).toString().replace('.', ',')
}

function formatQuantity(quantity: Quantity): string {
  if (quantity.high === null) {
    return formatNumber(quantity.low)
  }

  return `${formatNumber(quantity.low)}–${formatNumber(quantity.high)}`
}

export function formatIngredient(
  ingredient: ParsedIngredient & { unit: string | null }
): string {
  const parts: string[] = []

  if (ingredient.quantity !== null) {
    parts.push(formatQuantity(ingredient.quantity))
  }

  if (ingredient.unit !== null && ingredient.unit !== '') {
    parts.push(ingredient.unit)
  }

  if (ingredient.name !== '') {
    parts.push(ingredient.name)
  }

  const line = parts.join(' ')

  if (ingredient.note !== null && ingredient.note !== '') {
    return `${line} (${ingredient.note})`
  }

  return line
}
