import { formatNumber } from '../formatting/swedish'
import { parseQuantity } from '../parsing/quantity'
import { convert } from './units'

const glyphs = '½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞'
const number = `(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d*[${glyphs}]|\\d+(?:\\.\\d+)?)`

const imperial = new RegExp(
  `(${number})\\s*-?\\s*(ounces?|oz|pounds?|lbs?|inches|inch|cups?|tablespoons?|tbsp|teaspoons?|tsp|fl\\.?\\s?oz|fluid\\s+ounces?|pints?|quarts?|gallons?)\\b\\.?`,
  'gi'
)

const spelledMetric = new RegExp(
  `(${number})\\s*(grams?|kilograms?|kilos?|milliliters?|millilitres?|litres?|liters?|deciliters?|decilitres?)\\b`,
  'gi'
)

const metricAbbreviations: Record<string, string> = {
  gram: 'g',
  grams: 'g',
  kilogram: 'kg',
  kilograms: 'kg',
  kilo: 'kg',
  kilos: 'kg',
  milliliter: 'ml',
  milliliters: 'ml',
  millilitre: 'ml',
  millilitres: 'ml',
  liter: 'l',
  liters: 'l',
  litre: 'l',
  litres: 'l',
  deciliter: 'dl',
  deciliters: 'dl',
  decilitre: 'dl',
  decilitres: 'dl'
}

function formatRange(low: number, high: number | null, unit: string): string {
  if (high === null) {
    return `${formatNumber(low)} ${unit}`
  }

  return `${formatNumber(low)}–${formatNumber(high)} ${unit}`
}

export function convertMeasurements(text: string): string {
  return text
    .replace(imperial, (match, amount: string, unit: string) => {
      const { quantity } = parseQuantity(amount.trim())

      if (quantity === null) {
        return match
      }

      const unitLower = unit.toLowerCase()

      if (unitLower === 'inch' || unitLower === 'inches') {
        return formatRange(
          Math.round(quantity.low * 2.54),
          quantity.high === null ? null : Math.round(quantity.high * 2.54),
          'cm'
        )
      }

      const converted = convert(quantity, unit)

      if (converted.quantity === null || converted.unit === null) {
        return match
      }

      return formatRange(
        converted.quantity.low,
        converted.quantity.high,
        converted.unit
      )
    })
    .replace(spelledMetric, (_match, amount: string, unit: string) => {
      return `${amount} ${metricAbbreviations[unit.toLowerCase()]}`
    })
}
