import { useEffect, useState } from 'react'

import type { RecipeItem } from './types'
import { convertRecipe } from './pipeline'
import { readActiveTab } from './popup/read-active-tab'

const injectionError =
  'Tillägget kan inte läsa den här sidan. Öppna ett recept i en vanlig webbflik och försök igen.'

const emptyMessage =
  'Kunde inte hitta några ingredienser på den här sidan. Markera ingredienslistan och försök igen.'

type Status =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; items: RecipeItem[] }

function hasIngredients(items: RecipeItem[]): boolean {
  return items.some((item) => item.kind === 'ingredient')
}

function toClipboard(items: RecipeItem[]): string {
  const lines: string[] = []

  items.forEach((item, index) => {
    if (item.kind === 'heading' && index > 0) {
      lines.push('')
    }

    lines.push(item.text)
  })

  return lines.join('\n')
}

export function App() {
  const [status, setStatus] = useState<Status>({ kind: 'loading' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const raw = await readActiveTab()

        if (!cancelled) {
          setStatus({ kind: 'ready', items: convertRecipe(raw) })
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

  async function copyAll(items: RecipeItem[]) {
    try {
      await navigator.clipboard.writeText(toClipboard(items))

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

        {status.kind === 'ready' && hasIngredients(status.items) && (
          <button
            type="button"
            onClick={() => void copyAll(status.items)}
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

      {status.kind === 'ready' && !hasIngredients(status.items) && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          {emptyMessage}
        </p>
      )}

      {status.kind === 'ready' && hasIngredients(status.items) && (
        <ul className="flex flex-col">
          {status.items.map((item, index) =>
            item.kind === 'heading' ? (
              <li
                key={index}
                className="mb-0.5 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 first:mt-0"
              >
                {item.text}
              </li>
            ) : (
              <li key={index} className="py-1.5">
                <p className="text-sm font-medium">{item.text}</p>
                <p className="text-xs text-slate-400">{item.original}</p>
              </li>
            )
          )}
        </ul>
      )}
    </main>
  )
}
