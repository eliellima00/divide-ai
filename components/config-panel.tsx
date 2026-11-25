'use client'

import { MoneyInput } from '@/components/money-input'
import { cn } from '@/lib/utils'
import type { CouvertMode } from '@/lib/types'

type Props = {
  servicePct: number
  couvertMode: CouvertMode
  couvertValue: number
  onServicePct: (v: number) => void
  onCouvert: (mode: CouvertMode, value: number) => void
}

const SERVICE_PRESETS = [0, 5, 10, 12, 13]

const COUVERT_OPTIONS: { value: CouvertMode; label: string; hint: string }[] = [
  { value: 'none', label: 'Sem couvert', hint: 'Não cobrar' },
  { value: 'perPerson', label: 'Por pessoa', hint: 'Valor fixo por pessoa' },
  { value: 'split', label: 'Dividir igual', hint: 'Valor total ÷ pessoas' },
]

export function ConfigPanel({
  servicePct,
  couvertMode,
  couvertValue,
  onServicePct,
  onCouvert,
}: Props) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-4">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Taxa do garçom
          </label>
          <span className="font-mono text-sm tabular-nums text-primary">
            {servicePct}%
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SERVICE_PRESETS.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => onServicePct(pct)}
              className={cn(
                'flex-1 rounded-lg border px-2 py-2 text-sm font-medium tabular-nums transition-colors',
                servicePct === pct
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-background/50 text-muted-foreground hover:text-foreground',
              )}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-sm font-medium text-foreground">
          Couvert artístico
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {COUVERT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onCouvert(opt.value, couvertValue)}
              className={cn(
                'flex flex-col items-start gap-0.5 rounded-lg border px-2.5 py-2 text-left transition-colors',
                couvertMode === opt.value
                  ? 'border-primary bg-primary/15'
                  : 'border-border bg-background/50 hover:border-input',
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  couvertMode === opt.value
                    ? 'text-primary'
                    : 'text-foreground',
                )}
              >
                {opt.label}
              </span>
              <span className="text-[11px] leading-tight text-muted-foreground">
                {opt.hint}
              </span>
            </button>
          ))}
        </div>

        {couvertMode !== 'none' && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-sm text-muted-foreground">
              {couvertMode === 'perPerson'
                ? 'Valor por pessoa'
                : 'Valor total do couvert'}
            </span>
            <MoneyInput
              aria-label="Valor do couvert"
              value={couvertValue}
              onChange={(v) => onCouvert(couvertMode, v)}
              className="w-32"
            />
          </div>
        )}
      </div>
    </div>
  )
}
