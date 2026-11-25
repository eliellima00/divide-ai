'use client'

import { PartyPopper } from 'lucide-react'
import { personColor } from '@/components/people-manager'
import { billSummary, formatBRL, personBreakdown } from '@/lib/calc'
import type { BillState } from '@/lib/types'

type Props = {
  state: BillState
}

export function SummarySheet({ state }: Props) {
  const summary = billSummary(state)
  const pct =
    summary.grandTotal > 0
      ? Math.min(100, (summary.assignedTotal / summary.grandTotal) * 100)
      : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total da conta</p>
            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
              {formatBRL(summary.grandTotal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {summary.fullyAssigned ? 'Tudo dividido' : 'Falta pagar'}
            </p>
            <p
              className={`font-mono text-2xl font-semibold tabular-nums ${
                summary.fullyAssigned ? 'text-primary' : 'text-accent'
              }`}
            >
              {formatBRL(summary.remaining)}
            </p>
          </div>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Itens</p>
            <p className="font-mono text-sm tabular-nums text-foreground">
              {formatBRL(summary.itemsSubtotal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Taxa</p>
            <p className="font-mono text-sm tabular-nums text-foreground">
              {formatBRL(summary.serviceTotal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Couvert</p>
            <p className="font-mono text-sm tabular-nums text-foreground">
              {formatBRL(summary.couvertTotal)}
            </p>
          </div>
        </div>

        {summary.fullyAssigned && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary/15 py-2 text-sm font-medium text-primary">
            <PartyPopper className="size-4" />
            Conta 100% dividida!
          </div>
        )}
      </div>

      {state.people.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quanto cada um paga
          </p>
          {state.people.map((p, i) => {
            const b = personBreakdown(state, p.id)
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${personColor(i)}`}
                  >
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {p.name}
                    </p>
                    <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {formatBRL(b.consumo)} + taxa {formatBRL(b.taxa)}
                      {b.couvert > 0 && <> + couv. {formatBRL(b.couvert)}</>}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 font-mono text-base font-semibold tabular-nums text-foreground">
                  {formatBRL(b.total)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
