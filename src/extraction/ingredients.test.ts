import { expect, test } from 'bun:test'

import { extractIngredients } from './ingredients'

test('reads recipeIngredient from a top-level Recipe', () => {
  const jsonLd = JSON.stringify({
    '@type': 'Recipe',
    recipeIngredient: ['2 cups flour', '1 tsp salt']
  })

  expect(
    extractIngredients({ jsonLd: [jsonLd], microdata: [], selection: '' })
  ).toEqual(['2 cups flour', '1 tsp salt'])
})

test('finds a Recipe nested inside an @graph', () => {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage' },
      { '@type': ['Recipe'], recipeIngredient: ['3 eggs'] }
    ]
  })

  expect(
    extractIngredients({ jsonLd: [jsonLd], microdata: [], selection: '' })
  ).toEqual(['3 eggs'])
})

test('ignores malformed json-ld and falls back to microdata', () => {
  expect(
    extractIngredients({
      jsonLd: ['{ not valid json'],
      microdata: ['1 cup rice', '  '],
      selection: ''
    })
  ).toEqual(['1 cup rice'])
})

test('falls back to selection split into lines', () => {
  expect(
    extractIngredients({
      jsonLd: [],
      microdata: [],
      selection: '2 cups flour\n\n1 tsp salt\n'
    })
  ).toEqual(['2 cups flour', '1 tsp salt'])
})

test('returns an empty list when nothing is available', () => {
  expect(
    extractIngredients({ jsonLd: [], microdata: [], selection: '   ' })
  ).toEqual([])
})

test('trims whitespace and drops empty ingredient strings', () => {
  const jsonLd = JSON.stringify({
    '@type': 'Recipe',
    recipeIngredient: ['  2 cups flour  ', '', '1 tsp salt']
  })

  expect(
    extractIngredients({ jsonLd: [jsonLd], microdata: [], selection: '' })
  ).toEqual(['2 cups flour', '1 tsp salt'])
})
