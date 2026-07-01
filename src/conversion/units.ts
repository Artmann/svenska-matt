import type { ConvertedQuantity, Quantity } from '../types'

type UnitKey =
  | 'cup'
  | 'tablespoon'
  | 'teaspoon'
  | 'ounce'
  | 'pound'
  | 'fluidOunce'
  | 'pint'
  | 'quart'
  | 'gallon'
  | 'stick'
  | 'gram'
  | 'kilogram'
  | 'milliliter'
  | 'deciliter'
  | 'liter'
  | 'msk'
  | 'tsk'
  | 'krm'

const aliases: Record<UnitKey, string[]> = {
  cup: ['cup', 'cups'],
  tablespoon: ['tablespoon', 'tablespoons', 'tbsp', 'tbs', 'tbl'],
  teaspoon: ['teaspoon', 'teaspoons', 'tsp'],
  ounce: ['ounce', 'ounces', 'oz'],
  pound: ['pound', 'pounds', 'lb', 'lbs'],
  fluidOunce: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz'],
  pint: ['pint', 'pints', 'pt'],
  quart: ['quart', 'quarts', 'qt'],
  gallon: ['gallon', 'gallons', 'gal'],
  stick: ['stick', 'sticks'],
  gram: ['gram', 'grams', 'gramme', 'grammes', 'g', 'gr'],
  kilogram: ['kilogram', 'kilograms', 'kilo', 'kilos', 'kg'],
  milliliter: ['milliliter', 'milliliters', 'millilitre', 'millilitres', 'ml'],
  deciliter: ['deciliter', 'deciliters', 'decilitre', 'decilitres', 'dl'],
  liter: ['liter', 'liters', 'litre', 'litres', 'l'],
  msk: ['msk', 'matsked', 'matskedar'],
  tsk: ['tsk', 'tesked', 'teskedar'],
  krm: ['krm', 'kryddmått']
}

const aliasToKey: Record<string, UnitKey> = {}

for (const key of Object.keys(aliases) as UnitKey[]) {
  for (const alias of aliases[key]) {
    aliasToKey[alias] = key
  }
}

interface ImperialSpec {
  factor: number
  target: string
  promote: { threshold: number; divisor: number; unit: string } | null
}

const imperialSpecs: Partial<Record<UnitKey, ImperialSpec>> = {
  cup: { factor: 2.4, target: 'dl', promote: null },
  tablespoon: { factor: 1, target: 'msk', promote: null },
  teaspoon: { factor: 1, target: 'tsk', promote: null },
  ounce: { factor: 28.35, target: 'g', promote: null },
  pound: {
    factor: 453.592,
    target: 'g',
    promote: { threshold: 1000, divisor: 1000, unit: 'kg' }
  },
  stick: { factor: 113, target: 'g', promote: null },
  fluidOunce: { factor: 0.2957, target: 'dl', promote: null },
  pint: {
    factor: 4.73,
    target: 'dl',
    promote: { threshold: 10, divisor: 10, unit: 'l' }
  },
  quart: {
    factor: 9.46,
    target: 'dl',
    promote: { threshold: 10, divisor: 10, unit: 'l' }
  },
  gallon: { factor: 3.785, target: 'l', promote: null }
}

const metricLabels: Partial<Record<UnitKey, string>> = {
  gram: 'g',
  kilogram: 'kg',
  milliliter: 'ml',
  deciliter: 'dl',
  liter: 'l',
  msk: 'msk',
  tsk: 'tsk',
  krm: 'krm'
}

const roundingSteps: Record<string, number> = {
  dl: 0.5,
  msk: 0.125,
  tsk: 0.125,
  krm: 1,
  ml: 5,
  l: 0.1,
  g: 5,
  kg: 0.1
}

function round(value: number, unit: string): number {
  const step = roundingSteps[unit] ?? 0.1

  return Number((Math.round(value / step) * step).toFixed(4))
}

export function normalizeUnit(token: string): UnitKey | null {
  const cleaned = token
    .toLowerCase()
    .trim()
    .replace(/\.+$/, '')
    .replace(/\s+/g, ' ')

  if (cleaned === '') {
    return null
  }

  return aliasToKey[cleaned] ?? null
}

export function convert(
  quantity: Quantity | null,
  rawUnit: string | null
): ConvertedQuantity {
  const key = rawUnit === null ? null : normalizeUnit(rawUnit)

  if (key === null) {
    return {
      quantity,
      unit: rawUnit === null || rawUnit === '' ? null : rawUnit
    }
  }

  const metricLabel = metricLabels[key]

  if (metricLabel) {
    return { quantity, unit: metricLabel }
  }

  const spec = imperialSpecs[key]

  if (!spec || quantity === null) {
    return { quantity, unit: rawUnit }
  }

  const lowBase = quantity.low * spec.factor
  const highBase = quantity.high === null ? null : quantity.high * spec.factor
  const peak = Math.max(lowBase, highBase ?? lowBase)

  const promoted = spec.promote !== null && peak >= spec.promote.threshold
  const unit = promoted ? spec.promote!.unit : spec.target
  const divisor = promoted ? spec.promote!.divisor : 1

  return {
    quantity: {
      low: round(lowBase / divisor, unit),
      high: highBase === null ? null : round(highBase / divisor, unit)
    },
    unit
  }
}
