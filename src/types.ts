export interface Quantity {
  low: number
  high: number | null
}

export interface ParsedIngredient {
  quantity: Quantity | null
  unit: string | null
  name: string
  note: string | null
}

export interface ConvertedQuantity {
  quantity: Quantity | null
  unit: string | null
}

export interface RawPageData {
  jsonLd: string[]
  microdata: string[]
  selection: string
}

export interface ConvertedIngredient {
  original: string
  text: string
}

export type RecipeItem =
  | { kind: 'heading'; text: string }
  | { kind: 'ingredient'; original: string; text: string }
