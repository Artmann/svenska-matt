import type { RawPageData } from '../types'
import { extractRawPageData } from '../extraction/extract'

export async function readActiveTab(): Promise<RawPageData> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (!tab?.id) {
    throw new Error('Ingen aktiv flik kunde läsas.')
  }

  const injection = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractRawPageData
  })

  const result = injection[0]?.result

  if (!result) {
    throw new Error('Kunde inte läsa sidans innehåll.')
  }

  return result
}
