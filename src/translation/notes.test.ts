import { expect, test } from 'bun:test'

import { translateNote } from './notes'

test('translates a single preparation word', () => {
  expect(translateNote('drained')).toEqual('avrunnen')
})

test('translates a preparation phrase', () => {
  expect(translateNote('for serving')).toEqual('till servering')
})

test('translates each comma separated segment', () => {
  expect(translateNote('optional, to taste')).toEqual('valfritt, efter smak')
})

test('translates a segment joined by "and"', () => {
  expect(translateNote('drained and rinsed')).toEqual('avrunnen och sköljd')
})

test('converts an embedded size annotation', () => {
  expect(translateNote('28-ounce, drained')).toEqual('795 g, avrunnen')
})

test('leaves unknown prose untranslated but converts its measurements', () => {
  expect(translateNote('cut into ½-inch pieces')).toEqual(
    'cut into 1 cm pieces'
  )
})
