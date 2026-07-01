import type { ConvertedIngredient, RawPageData, RecipeItem } from './types'
import { convert } from './conversion/units'
import { convertMeasurements } from './conversion/measurements'
import { convertTemperatures } from './conversion/temperature'
import { extractIngredients } from './extraction/ingredients'
import { formatIngredient } from './formatting/swedish'
import { parseIngredient } from './parsing/parse-ingredient'
import { isSectionHeading, sectionHeadingText } from './section'
import { translateName } from './translation/translate-name'
import { translateNote } from './translation/notes'

export function convertIngredientLine(line: string): ConvertedIngredient {
  const parsed = parseIngredient(line)
  const converted = convert(parsed.quantity, parsed.unit)
  const name = convertMeasurements(
    convertTemperatures(translateName(parsed.name))
  )
  const note = parsed.note === null ? null : translateNote(parsed.note)

  const text = formatIngredient({
    quantity: converted.quantity,
    unit: converted.unit,
    name,
    note
  })

  return { original: line, text }
}

export function convertRecipe(raw: RawPageData): RecipeItem[] {
  return extractIngredients(raw).map((line) =>
    isSectionHeading(line)
      ? { kind: 'heading', text: sectionHeadingText(line) }
      : { kind: 'ingredient', ...convertIngredientLine(line) }
  )
}
