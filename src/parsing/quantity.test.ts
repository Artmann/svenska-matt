import { expect, test } from 'bun:test'

import { parseQuantity } from './quantity'

test('parses a whole number', () => {
  expect(parseQuantity('2 cups flour')).toEqual({
    quantity: { low: 2, high: null },
    rest: ' cups flour'
  })
})

test('parses a decimal number', () => {
  expect(parseQuantity('1.5 cups sugar')).toEqual({
    quantity: { low: 1.5, high: null },
    rest: ' cups sugar'
  })
})

test('parses an ascii fraction', () => {
  expect(parseQuantity('1/2 cup butter')).toEqual({
    quantity: { low: 0.5, high: null },
    rest: ' cup butter'
  })
})

test('parses a unicode fraction', () => {
  expect(parseQuantity('½ tsp salt')).toEqual({
    quantity: { low: 0.5, high: null },
    rest: ' tsp salt'
  })
})

test('parses a mixed ascii number', () => {
  expect(parseQuantity('1 1/2 cups milk')).toEqual({
    quantity: { low: 1.5, high: null },
    rest: ' cups milk'
  })
})

test('parses a mixed unicode number without a space', () => {
  expect(parseQuantity('1½ cups milk')).toEqual({
    quantity: { low: 1.5, high: null },
    rest: ' cups milk'
  })
})

test('parses a hyphen range', () => {
  expect(parseQuantity('2-3 cloves garlic')).toEqual({
    quantity: { low: 2, high: 3 },
    rest: ' cloves garlic'
  })
})

test('parses a "to" range', () => {
  expect(parseQuantity('2 to 3 apples')).toEqual({
    quantity: { low: 2, high: 3 },
    rest: ' apples'
  })
})

test('does not treat a trailing hyphen word as a range', () => {
  expect(parseQuantity('1-inch piece of ginger')).toEqual({
    quantity: { low: 1, high: null },
    rest: '-inch piece of ginger'
  })
})

test('returns null quantity when the line has no leading number', () => {
  expect(parseQuantity('salt to taste')).toEqual({
    quantity: null,
    rest: 'salt to taste'
  })
})
