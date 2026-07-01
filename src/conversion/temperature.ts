const fahrenheitPattern =
  /(\d+(?:\.\d+)?)\s*(?:°\s*f(?:ahrenheit)?\b|degrees?\s*f(?:ahrenheit)?\b|f\b|fahrenheit\b)/gi

function fahrenheitToCelsius(fahrenheit: number): number {
  const celsius = ((fahrenheit - 32) * 5) / 9

  return Math.round(celsius / 5) * 5
}

export function convertTemperatures(text: string): string {
  return text.replace(fahrenheitPattern, (_match, value: string) => {
    return `${fahrenheitToCelsius(Number(value))}°C`
  })
}
