import { expect, test } from 'bun:test'

import { convertMeasurements } from './measurements'

test('converts a hyphenated ounce size to grams', () => {
  expect(convertMeasurements('28-ounce')).toEqual('795 g')
})

test('converts an abbreviated ounce size and its trailing dot', () => {
  expect(convertMeasurements('16-oz.')).toEqual('455 g')
})

test('converts inches to centimeters', () => {
  expect(convertMeasurements('a 12-inch skillet')).toEqual('a 30 cm skillet')
})

test('converts a fractional inch', () => {
  expect(convertMeasurements('cut into ½-inch pieces')).toEqual(
    'cut into 1 cm pieces'
  )
})

test('converts a spelled-out cup measure inside text', () => {
  expect(convertMeasurements('plus 2 cups more')).toEqual('plus 5 dl more')
})

test('abbreviates spelled-out metric units', () => {
  expect(convertMeasurements('142 grams')).toEqual('142 g')
})

test('leaves text without a measurement untouched', () => {
  expect(convertMeasurements('drained and rinsed')).toEqual(
    'drained and rinsed'
  )
})
