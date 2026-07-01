import { expect, test } from 'bun:test'

import { convertIngredientLine, convertRecipe } from './pipeline'

test('converts an imperial line into a swedish one', () => {
  expect(convertIngredientLine('2 cups all-purpose flour')).toEqual({
    original: '2 cups all-purpose flour',
    text: '5 dl vetemjöl'
  })
})

test('converts weight and translates the name', () => {
  expect(convertIngredientLine('4 oz butter')).toEqual({
    original: '4 oz butter',
    text: '115 g smör'
  })
})

test('keeps a countable ingredient with a translated name', () => {
  expect(convertIngredientLine('2 large eggs')).toEqual({
    original: '2 large eggs',
    text: '2 ägg'
  })
})

test('carries a translated note and translates the name', () => {
  expect(convertIngredientLine('1 cup butter (softened)')).toEqual({
    original: '1 cup butter (softened)',
    text: '2½ dl smör (mjuk)'
  })
})

test('converts a fahrenheit mention inside the name', () => {
  expect(convertIngredientLine('1 cup water heated to 110°F')).toEqual({
    original: '1 cup water heated to 110°F',
    text: '2½ dl water heated to 45°C'
  })
})

test('converts a whole page of structured data', () => {
  const jsonLd = JSON.stringify({
    '@type': 'Recipe',
    recipeIngredient: ['2 cups flour', '1 tsp salt', '3 tomatoes, diced']
  })

  expect(
    convertRecipe({ jsonLd: [jsonLd], microdata: [], selection: '' })
  ).toEqual([
    { kind: 'ingredient', original: '2 cups flour', text: '5 dl vetemjöl' },
    { kind: 'ingredient', original: '1 tsp salt', text: '1 tsk salt' },
    {
      kind: 'ingredient',
      original: '3 tomatoes, diced',
      text: '3 tomat (tärnad)'
    }
  ])
})

test('preserves section headings from a selected list', () => {
  const selection = [
    'Pastry Crust',
    '2 cups all purpose flour',
    '1/4 cup sugar',
    'Cream Filling',
    '1 cup heavy cream',
    '1 tsp vanilla'
  ].join('\n')

  expect(convertRecipe({ jsonLd: [], microdata: [], selection })).toEqual([
    { kind: 'heading', text: 'Pastry Crust' },
    {
      kind: 'ingredient',
      original: '2 cups all purpose flour',
      text: '5 dl vetemjöl'
    },
    { kind: 'ingredient', original: '1/4 cup sugar', text: '½ dl socker' },
    { kind: 'heading', text: 'Cream Filling' },
    {
      kind: 'ingredient',
      original: '1 cup heavy cream',
      text: '2½ dl vispgrädde'
    },
    { kind: 'ingredient', original: '1 tsp vanilla', text: '1 tsk vanilj' }
  ])
})
