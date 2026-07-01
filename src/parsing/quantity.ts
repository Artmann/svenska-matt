import type { Quantity } from '../types'

const unicodeFractions: Record<string, number> = {
  '½': 1 / 2,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 1 / 4,
  '¾': 3 / 4,
  '⅕': 1 / 5,
  '⅖': 2 / 5,
  '⅗': 3 / 5,
  '⅘': 4 / 5,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅐': 1 / 7,
  '⅛': 1 / 8,
  '⅜': 3 / 8,
  '⅝': 5 / 8,
  '⅞': 7 / 8,
  '⅑': 1 / 9,
  '⅒': 1 / 10
}

const fractionGlyphs = Object.keys(unicodeFractions).join('')

interface NumberMatch {
  value: number
  rest: string
}

function readNumber(text: string): NumberMatch | null {
  const patterns: Array<{
    regex: RegExp
    value: (match: RegExpMatchArray) => number
  }> = [
    {
      regex: /^(\d+)\s+(\d+)\/(\d+)/,
      value: (match) => Number(match[1]) + Number(match[2]) / Number(match[3])
    },
    {
      regex: new RegExp(`^(\\d+)\\s*([${fractionGlyphs}])`),
      value: (match) => Number(match[1]) + unicodeFractions[match[2]]
    },
    {
      regex: /^(\d+)\/(\d+)/,
      value: (match) => Number(match[1]) / Number(match[2])
    },
    {
      regex: new RegExp(`^([${fractionGlyphs}])`),
      value: (match) => unicodeFractions[match[1]]
    },
    {
      regex: /^(\d+(?:\.\d+)?)/,
      value: (match) => Number(match[1])
    }
  ]

  for (const { regex, value } of patterns) {
    const match = text.match(regex)

    if (match) {
      return { value: value(match), rest: text.slice(match[0].length) }
    }
  }

  return null
}

export function parseQuantity(input: string): {
  quantity: Quantity | null
  rest: string
} {
  const first = readNumber(input)

  if (!first) {
    return { quantity: null, rest: input }
  }

  const separator = first.rest.match(
    /^(?:\s*(?:-|–|—)\s*|\s+(?:to|through)\s+)/i
  )

  if (separator) {
    const second = readNumber(first.rest.slice(separator[0].length))

    if (second) {
      return {
        quantity: { low: first.value, high: second.value },
        rest: second.rest
      }
    }
  }

  return { quantity: { low: first.value, high: null }, rest: first.rest }
}
