import { expect, test } from 'bun:test'

import { parseIngredient } from './parse-ingredient'

test('parses quantity, unit and name', () => {
  expect(parseIngredient('2 cups flour')).toEqual({
    quantity: { low: 2, high: null },
    unit: 'cups',
    name: 'flour',
    note: null
  })
})

test('parses a mixed number with a unit abbreviation', () => {
  expect(parseIngredient('1 1/2 tbsp. olive oil')).toEqual({
    quantity: { low: 1.5, high: null },
    unit: 'tbsp.',
    name: 'olive oil',
    note: null
  })
})

test('strips a leading "of" after the unit', () => {
  expect(parseIngredient('1 cup of sugar')).toEqual({
    quantity: { low: 1, high: null },
    unit: 'cup',
    name: 'sugar',
    note: null
  })
})

test('treats a non-unit word as part of the name', () => {
  expect(parseIngredient('2 large eggs')).toEqual({
    quantity: { low: 2, high: null },
    unit: null,
    name: 'large eggs',
    note: null
  })
})

test('extracts a parenthetical note', () => {
  expect(parseIngredient('1 cup butter (softened)')).toEqual({
    quantity: { low: 1, high: null },
    unit: 'cup',
    name: 'butter',
    note: 'softened'
  })
})

test('extracts a trailing comma note', () => {
  expect(parseIngredient('3 tomatoes, diced')).toEqual({
    quantity: { low: 3, high: null },
    unit: null,
    name: 'tomatoes',
    note: 'diced'
  })
})

test('parses a two-word unit', () => {
  expect(parseIngredient('4 fl oz milk')).toEqual({
    quantity: { low: 4, high: null },
    unit: 'fl oz',
    name: 'milk',
    note: null
  })
})

test('parses an ingredient without a quantity', () => {
  expect(parseIngredient('salt')).toEqual({
    quantity: null,
    unit: null,
    name: 'salt',
    note: null
  })
})

test('moves a trailing preparation phrase into the note', () => {
  expect(parseIngredient('salt to taste')).toEqual({
    quantity: null,
    unit: null,
    name: 'salt',
    note: 'to taste'
  })
})

test('strips a leading list marker and trailing gram annotation', () => {
  expect(parseIngredient('▢1 cup granulated sugar 200g')).toEqual({
    quantity: { low: 1, high: null },
    unit: 'cup',
    name: 'granulated sugar',
    note: null
  })
})
