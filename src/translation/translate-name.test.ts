import { expect, test } from 'bun:test'

import { translateName } from './translate-name'

test('translates a direct dictionary match', () => {
  expect(translateName('flour')).toEqual('vetemjöl')
})

test('is case insensitive', () => {
  expect(translateName('Butter')).toEqual('smör')
})

test('translates a simple plural', () => {
  expect(translateName('eggs')).toEqual('ägg')
})

test('translates a plural ending in ies', () => {
  expect(translateName('strawberries')).toEqual('jordgubbe')
})

test('strips leading descriptors before looking up', () => {
  expect(translateName('finely chopped fresh parsley')).toEqual('persilja')
})

test('prefers the longest matching phrase', () => {
  expect(translateName('olive oil')).toEqual('olivolja')
})

test('strips a common quantity descriptor', () => {
  expect(translateName('granulated sugar')).toEqual('socker')
})

test('keeps a descriptor-qualified phrase that has its own entry', () => {
  expect(translateName('white sugar')).toEqual('strösocker')
})

test('translates an "and" conjunction of known ingredients', () => {
  expect(translateName('salt and pepper')).toEqual('salt och peppar')
})

test('leaves a conjunction untranslated when a side is unknown', () => {
  expect(translateName('salt and dragon fruit')).toEqual(
    'salt and dragon fruit'
  )
})

test('falls back to the original name when unknown', () => {
  expect(translateName('dragon fruit')).toEqual('dragon fruit')
})

test('trims surrounding whitespace on the fallback', () => {
  expect(translateName('  quince  ')).toEqual('quince')
})
