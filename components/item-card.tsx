'use client'

import { useState } from 'react'
import { Check, Minus, Pencil, Plus, Trash2 } from 'lucide-react'
import { MoneyInput } from '@/components/money-input'
import { personColor } from '@/components/people-manager'
import { Button } from '@/components/ui/button'
import { formatBRL, itemTotal } from '@/lib/calc'
import { cn } from '@/lib/utils'
import type { Item, Person } from '@/lib/types'

type Props = {
  item: Item
  people: Person[]
  onTogglePayer: (personId: string) => void
  onUpdate: (patch: Partial<Item>) => void
  onRemove: () => void
}

export function ItemCard({
  item,
  people,
  onTogglePayer,
  onUpdate,
  onRemove,
}: Props) {
  const [editing, setEditing] = useState(item.name === '')
  const total = itemTotal(item)
  const assigned = item.payers.length > 0
  const perPayer = assigned ? total / item.payers.length : 0

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card p-3.5 transition-colors',
        assigned ? 'border-primary/40' : 'border-border',
      )}
    >
      {editing ? (
        <div className="flex flex-col gap-2.5">
          <input
            autoFocus
            value={item.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Nome do item"
            className="h-9 w-full rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/40"
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Qtd</span>
              <div className="flex items-center gap-1 rounded-lg border border-input bg-background/60 px-1">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  onClick={() =>
                    onUpdate({ quantity: Math.max(1, item.quantity - 1) })
                  }
                  className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-5 text-center font-mono text-sm tabular-nums">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  onClick={() => onUpdate({ quantity: item.quantity + 1 })}
                  className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
            <MoneyInput
              aria-label="Preço unitário"
              value={item.unitPrice}
              onChange={(v) => onUpdate({ unitPrice: v })}
              className="flex-1"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={onRemove}
              aria-label="Remover item"
            >
              <Trash2 className="size-3.5" />
              Remover
            </Button>
            <Button
              size="sm"
              onClick={() => item.name.trim() && setEditing(false)}
            >
              <Check className="size-3.5" />
              Pronto
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="group flex min-w-0 flex-1 items-center gap-1.5 text-left"
            >
              <span className="truncate font-medium text-foreground">
                {item.quantity > 1 && (
                  <span className="text-muted-foreground">
                    {item.quantity}x{' '}
                  </span>
                )}
                {item.name}
              </span>
              <Pencil className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {formatBRL(total)}
              </div>
              {assigned && item.payers.length > 1 && (
                <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {formatBRL(perPayer)} cada
                </div>
              )}
            </div>
          </div>

          {people.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {people.map((p) => {
                const active = item.payers.includes(p.id)
                const idx = people.findIndex((x) => x.id === p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onTogglePayer(p.id)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                      active
                        ? personColor(idx)
                        : 'bg-background/60 text-muted-foreground ring-1 ring-inset ring-border hover:text-foreground',
                    )}
                  >
                    {active && <Check className="size-3" />}
                    {p.name}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
