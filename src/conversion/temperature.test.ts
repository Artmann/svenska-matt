import { expect, test } from 'bun:test'

import { convertTemperatures } from './temperature'

test('converts a degree-sign fahrenheit value to celsius', () => {
  expect(convertTemperatures('warm the water to 110°F')).toEqual(
    'warm the water to 45°C'
  )
})

test('converts a spelled-out fahrenheit value', () => {
  expect(convertTemperatures('bake at 350 degrees F')).toEqual('bake at 175°C')
})

test('converts a fahrenheit value written in full', () => {
  expect(convertTemperatures('heat to 400 Fahrenheit')).toEqual('heat to 205°C')
})

test('leaves text without a fahrenheit value untouched', () => {
  expect(convertTemperatures('a pinch of salt')).toEqual('a pinch of salt')
})

test('does not convert a stray capital F in a word', () => {
  expect(convertTemperatures('2 cups of Flour')).toEqual('2 cups of Flour')
})
