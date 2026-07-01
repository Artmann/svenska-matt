import type { RawPageData } from '../types'

// Runs inside the inspected page via chrome.scripting.executeScript, so it must
// stay self-contained: no imports at runtime, no references to module scope.
export function extractRawPageData(): RawPageData {
  const jsonLd = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]')
  ).map((node) => node.textContent ?? '')

  const microdata = Array.from(
    document.querySelectorAll(
      '[itemprop="recipeIngredient"], [itemprop="ingredients"]'
    )
  ).map((node) => node.textContent ?? '')

  const selection = window.getSelection()?.toString() ?? ''

  return { jsonLd, microdata, selection }
}
