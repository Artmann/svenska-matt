import { expect, test } from 'bun:test'

import { formatIngredient, formatNumber } from './swedish'

test('formats a whole number plainly', () => {
  expect(formatNumber(3)).toEqual('3')
})

test('formats a half with a fraction glyph', () => {
  expect(formatNumber(0.5)).toEqual('½')
})

test('formats a mixed number with a fraction glyph', () => {
  expect(formatNumber(2.5)).toEqual('2½')
})

test('formats a quarter with a fraction glyph', () => {
  expect(formatNumber(1.25)).toEqual('1¼')
})

test('formats a non-fraction decimal with a comma', () => {
  expect(formatNumber(2.4)).toEqual('2,4')
})

test('assembles quantity, unit and name', () => {
  expect(
    formatIngredient({
      quantity: { low: 5, high: null },
      unit: 'dl',
      name: 'vetemjöl',
      note: null
    })
  ).toEqual('5 dl vetemjöl')
})

test('assembles a range with an en dash', () => {
  expect(
    formatIngredient({
      quantity: { low: 2, high: 3 },
      unit: null,
      name: 'vitlöksklyftor',
      note: null
    })
  ).toEqual('2–3 vitlöksklyftor')
})

test('assembles an ingredient without a quantity', () => {
  expect(
    formatIngredient({
      quantity: null,
      unit: null,
      name: 'salt',
      note: null
    })
  ).toEqual('salt')
})

test('appends a note in parentheses', () => {
  expect(
    formatIngredient({
      quantity: { low: 1, high: null },
      unit: 'dl',
      name: 'grädde',
      note: 'rumstempererad'
    })
  ).toEqual('1 dl grädde (rumstempererad)')
})
