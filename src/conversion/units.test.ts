import { expect, test } from 'bun:test'

import { convert, normalizeUnit } from './units'

test('normalizes unit aliases to canonical keys', () => {
  expect(normalizeUnit('cups')).toEqual('cup')
  expect(normalizeUnit('Tbsp.')).toEqual('tablespoon')
  expect(normalizeUnit('teaspoons')).toEqual('teaspoon')
  expect(normalizeUnit('oz')).toEqual('ounce')
  expect(normalizeUnit('lbs')).toEqual('pound')
  expect(normalizeUnit('dl')).toEqual('deciliter')
})

test('returns null for unrecognized units', () => {
  expect(normalizeUnit('clove')).toEqual(null)
  expect(normalizeUnit('')).toEqual(null)
})

test('converts cups to deciliter', () => {
  expect(convert({ low: 2, high: null }, 'cups')).toEqual({
    quantity: { low: 5, high: null },
    unit: 'dl'
  })
})

test('converts tablespoons to msk keeping the amount', () => {
  expect(convert({ low: 3, high: null }, 'tbsp')).toEqual({
    quantity: { low: 3, high: null },
    unit: 'msk'
  })
})

test('converts teaspoons to tsk keeping the amount', () => {
  expect(convert({ low: 1, high: null }, 'tsp')).toEqual({
    quantity: { low: 1, high: null },
    unit: 'tsk'
  })
})

test('converts ounces to grams', () => {
  expect(convert({ low: 4, high: null }, 'oz')).toEqual({
    quantity: { low: 115, high: null },
    unit: 'g'
  })
})

test('promotes large pound amounts to kilograms', () => {
  expect(convert({ low: 3, high: null }, 'lb')).toEqual({
    quantity: { low: 1.4, high: null },
    unit: 'kg'
  })
})

test('converts a range and keeps both ends', () => {
  expect(convert({ low: 1, high: 2 }, 'cups')).toEqual({
    quantity: { low: 2.5, high: 5 },
    unit: 'dl'
  })
})

test('passes already metric units through with a swedish label', () => {
  expect(convert({ low: 200, high: null }, 'grams')).toEqual({
    quantity: { low: 200, high: null },
    unit: 'g'
  })
})

test('keeps the original unit when it is not recognized', () => {
  expect(convert({ low: 2, high: null }, 'cloves')).toEqual({
    quantity: { low: 2, high: null },
    unit: 'cloves'
  })
})

test('handles a missing unit', () => {
  expect(convert({ low: 3, high: null }, null)).toEqual({
    quantity: { low: 3, high: null },
    unit: null
  })
})
