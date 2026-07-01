import { expect, test } from 'bun:test'

import { isSectionHeading, sectionHeadingText } from './section'

test('treats a "For the …:" line as a heading', () => {
  expect(isSectionHeading('For the Cupcakes:')).toEqual(true)
})

test('treats a "For …" line without a colon as a heading', () => {
  expect(isSectionHeading('For the Vanilla Buttercream')).toEqual(true)
})

test('treats a colon-less Title-Case line as a heading', () => {
  expect(isSectionHeading('Pastry Crust')).toEqual(true)
  expect(isSectionHeading('Cream Filling')).toEqual(true)
  expect(isSectionHeading('Strawberry Topping')).toEqual(true)
})

test('treats a line ending with a colon as a heading', () => {
  expect(isSectionHeading('Topping:')).toEqual(true)
})

test('does not treat a quantified ingredient as a heading', () => {
  expect(isSectionHeading('2 cups flour')).toEqual(false)
})

test('does not treat a known no-quantity ingredient as a heading', () => {
  expect(isSectionHeading('Kosher salt')).toEqual(false)
  expect(isSectionHeading('Freshly ground black pepper')).toEqual(false)
  expect(isSectionHeading('salt')).toEqual(false)
})

test('does not treat a known ingredient with a note as a heading', () => {
  expect(isSectionHeading('Hot sauce, for serving')).toEqual(false)
})

test('does not treat a long lowercase phrase as a heading', () => {
  expect(isSectionHeading('mix everything together in a large bowl')).toEqual(
    false
  )
})

test('preserves the heading text verbatim after decoding entities', () => {
  expect(sectionHeadingText('For the Cupcakes:')).toEqual('For the Cupcakes:')
  expect(sectionHeadingText('  Pastry &amp; Crust  ')).toEqual('Pastry & Crust')
})
