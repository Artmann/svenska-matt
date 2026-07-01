import { useEffect, useState } from 'react'

import type { ConvertedIngredient } from './types'
import { convertPageData } from './pipeline'
import { readActiveTab } from './popup/read-active-tab'

const injectionError =
  'Tillägget kan inte läsa den här sidan. Öppna ett recept i en vanlig webbflik och försök igen.'

const emptyMessage =
  'Kunde inte hitta några ingredienser på den här sidan. Markera ingredienslistan och försök igen.'

type Status =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; ingredients: ConvertedIngredient[] }

export function App() {
  const [status, setStatus] = useState<Status>({ kind: 'loading' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const raw = await readActiveTab()

        if (!cancelled) {
          setStatus({ kind: 'ready', ingredients: convertPageData(raw) })
        }
      } catch {
        if (!cancelled) {
          setStatus({ kind: 'error', message: injectionError })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  async function copyAll(ingredients: ConvertedIngredient[]) {
    try {
      await navigator.clipboard.writeText(
        ingredients.map((ingredient) => ingredient.text).join('\n')
      )

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="w-[360px] bg-white p-4 font-sans text-slate-900">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold leading-tight">
            Svenska Mått
          </h1>
          <p className="text-xs text-slate-500">Recept i svenska mått</p>
        </div>

        {status.kind === 'ready' && status.ingredients.length > 0 && (
          <button
            type="button"
            onClick={() => void copyAll(status.ingredients)}
            className="rounded-md bg-sky-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-800"
          >
            {copied ? 'Kopierat!' : 'Kopiera'}
          </button>
        )}
      </header>

      {status.kind === 'loading' && (
        <p className="py-6 text-center text-sm text-slate-500">Läser sidan …</p>
      )}

      {status.kind === 'error' && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          {status.message}
        </p>
      )}

      {status.kind === 'ready' && status.ingredients.length === 0 && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          {emptyMessage}
        </p>
      )}

      {status.kind === 'ready' && status.ingredients.length > 0 && (
        <ul className="flex flex-col divide-y divide-slate-100">
          {status.ingredients.map((ingredient, index) => (
            <li key={index} className="py-2">
              <p className="text-sm font-medium">{ingredient.text}</p>
              <p className="text-xs text-slate-400">{ingredient.original}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
