import type { RawPageData } from '../types'

function hasRecipeType(value: Record<string, unknown>): boolean {
  const type = value['@type']

  if (typeof type === 'string') {
    return type.toLowerCase() === 'recipe'
  }

  if (Array.isArray(type)) {
    return type.some(
      (entry) => typeof entry === 'string' && entry.toLowerCase() === 'recipe'
    )
  }

  return false
}

function collectRecipeIngredients(value: unknown, found: string[]): void {
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectRecipeIngredients(entry, found)
    }

    return
  }

  if (value === null || typeof value !== 'object') {
    return
  }

  const record = value as Record<string, unknown>

  if (hasRecipeType(record) && Array.isArray(record.recipeIngredient)) {
    for (const ingredient of record.recipeIngredient) {
      if (typeof ingredient === 'string') {
        found.push(ingredient)
      }
    }
  }

  for (const nested of Object.values(record)) {
    collectRecipeIngredients(nested, found)
  }
}

function clean(lines: string[]): string[] {
  return lines.map((line) => line.trim()).filter((line) => line !== '')
}

export function extractIngredients(raw: RawPageData): string[] {
  const fromJsonLd: string[] = []

  for (const block of raw.jsonLd) {
    try {
      collectRecipeIngredients(JSON.parse(block), fromJsonLd)
    } catch {
      // Ignore malformed structured data and try the next source.
    }
  }

  const structured = clean(fromJsonLd)

  if (structured.length > 0) {
    return structured
  }

  const microdata = clean(raw.microdata)

  if (microdata.length > 0) {
    return microdata
  }

  return clean(raw.selection.split('\n'))
}
