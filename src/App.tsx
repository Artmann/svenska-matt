import { useEffect, useState } from 'react'

import type { RecipeItem } from './types'
import { convertRecipe } from './pipeline'
import { readActiveTab } from './popup/read-active-tab'

const readError = {
  title: 'Sidan går inte att läsa.',
  detail: 'Öppna ett recept i en vanlig webbflik och försök igen.'
}

const emptyNotice = {
  title: 'Inga ingredienser hittades här.',
  detail: 'Markera ingredienslistan på sidan och öppna Svenska Mått igen.'
}

const skeletonWidths = ['70%', '54%', '82%', '48%', '64%']

type Status =
  | { kind: 'loading' }
  | { kind: 'error' }
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

function Notice({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mx-4 mb-4 flex gap-2.5 rounded-lg border border-hairline bg-raised px-3.5 py-3">
      <span
        aria-hidden
        className="mt-1.5 size-1.5 shrink-0 rounded-[1px] bg-accent"
      />
      <div>
        <p className="text-sm text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{detail}</p>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="px-4 pt-1 pb-4">
      {skeletonWidths.map((width, index) => (
        <div key={index} className="py-2">
          <div
            className="h-3.5 rounded bg-raised motion-safe:animate-pulse"
            style={{ width }}
          />
          <div className="mt-1.5 h-2.5 w-2/5 rounded bg-raised motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  )
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
          setStatus({ kind: 'error' })
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

  const showCopy = status.kind === 'ready' && hasIngredients(status.items)

  return (
    <main className="w-[360px] bg-surface pb-1 text-ink">
      <header className="border-b border-hairline px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-lg leading-none font-semibold tracking-tight text-ink">
            Svenska Mått<span className="text-accent">.</span>
          </h1>

          {showCopy && (
            <button
              type="button"
              onClick={() => void copyAll(status.items)}
              className="min-w-[4.75rem] rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-on-accent transition-colors hover:bg-accent-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
            >
              {copied ? 'Kopierat!' : 'Kopiera'}
            </button>
          )}
        </div>

        <p className="mt-1 text-xs text-ink-faint">Recept med Svenska Mått</p>
      </header>

      {status.kind === 'loading' && <Skeleton />}

      {status.kind === 'error' && <Notice {...readError} />}

      {status.kind === 'ready' && !hasIngredients(status.items) && (
        <Notice {...emptyNotice} />
      )}

      {status.kind === 'ready' && hasIngredients(status.items) && (
        <ul className="px-4 pt-1 pb-4">
          {status.items.map((item, index) =>
            item.kind === 'heading' ? (
              <li
                key={`h-${index}-${item.text}`}
                className="mt-5 mb-1 flex items-center gap-2 first:mt-1"
              >
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-[1px] bg-accent"
                />
                <span className="font-display text-[13px] font-medium text-ink">
                  {item.text}
                </span>
              </li>
            ) : (
              <li key={`i-${index}-${item.original}`} className="py-1.5">
                <p className="text-sm font-medium text-ink tabular-nums">
                  {item.text}
                </p>
                <p className="mt-0.5 text-xs text-ink-faint">{item.original}</p>
              </li>
            )
          )}
        </ul>
      )}
    </main>
  )
}
