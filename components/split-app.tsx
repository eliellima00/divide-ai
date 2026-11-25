'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Receipt, RotateCcw, Wine } from 'lucide-react'
import { ConfigPanel } from '@/components/config-panel'
import { ItemCard } from '@/components/item-card'
import { PeopleManager } from '@/components/people-manager'
import { Scanner } from '@/components/scanner'
import { SummarySheet } from '@/components/summary-sheet'
import { Button } from '@/components/ui/button'
import { billSummary, formatBRL } from '@/lib/calc'
import { useBill } from '@/lib/use-bill'
import type { ScannedItem } from '@/lib/types'

type Step = 'scan' | 'split'

export function SplitApp() {
  const bill = useBill()
  const { state } = bill
  const [step, setStep] = useState<Step>('scan')

  const summary = useMemo(() => billSummary(state), [state])

  function handleScanned(
    items: ScannedItem[],
    detected: { servicePct: number | null; couvertPerPerson: number | null },
  ) {
    bill.setItemsFromScan(items)
    if (detected.servicePct != null) bill.setServicePct(detected.servicePct)
    if (detected.couvertPerPerson != null) {
      bill.setCouvert('perPerson', detected.couvertPerPerson)
    }
    setStep('split')
  }

  function handleManual() {
    if (state.items.length === 0) bill.addItem()
    setStep('split')
  }

  function handleReset() {
    if (confirm('Começar uma nova conta? Os dados atuais serão apagados.')) {
      bill.reset()
      setStep('scan')
    }
  }

  if (!bill.hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Wine className="size-8 animate-pulse text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md">
        {step === 'split' ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Voltar para o scanner"
            onClick={() => setStep('scan')}
          >
            <ArrowLeft className="size-4" />
          </Button>
        ) : (
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Receipt className="size-4" />
          </span>
        )}
        <div className="flex-1">
          <h1 className="text-sm font-semibold leading-none text-foreground">
            Racha
          </h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {step === 'scan' ? 'Divida a conta do bar' : 'Marque o que cada um consumiu'}
          </p>
        </div>
        {(state.items.length > 0 || state.people.length > 0) && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Nova conta"
            onClick={handleReset}
          >
            <RotateCcw className="size-4" />
          </Button>
        )}
      </header>

      <main className="flex-1 px-4 py-5">
        {step === 'scan' ? (
          <div className="flex flex-col gap-5">
            <Scanner onScanned={handleScanned} onManual={handleManual} />
            {state.items.length > 0 && (
              <Button
                variant="secondary"
                size="lg"
                className="h-11"
                onClick={() => setStep('split')}
              >
                Continuar conta atual ({state.items.length}{' '}
                {state.items.length === 1 ? 'item' : 'itens'})
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5 pb-28">
            <PeopleManager
              people={state.people}
              onAdd={bill.addPerson}
              onRemove={bill.removePerson}
            />

            <ConfigPanel
              servicePct={state.config.servicePct}
              couvertMode={state.config.couvertMode}
              couvertValue={state.config.couvertValue}
              onServicePct={bill.setServicePct}
              onCouvert={bill.setCouvert}
            />

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Itens da comanda
                </p>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatBRL(summary.itemsSubtotal)}
                </span>
              </div>

              {state.items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum item ainda. Adicione abaixo ou volte para escanear a
                  comanda.
                </p>
              ) : (
                state.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    people={state.people}
                    onTogglePayer={(pid) => bill.togglePayer(item.id, pid)}
                    onUpdate={(patch) => bill.updateItem(item.id, patch)}
                    onRemove={() => bill.removeItem(item.id)}
                  />
                ))
              )}

              <Button
                variant="outline"
                size="lg"
                className="h-11"
                onClick={() => bill.addItem()}
              >
                <Plus className="size-4" />
                Adicionar item
              </Button>
            </div>

            <SummarySheet state={state} />
          </div>
        )}
      </main>

      {step === 'split' && (
        <footer className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">
                {summary.fullyAssigned ? 'Tudo dividido' : 'Falta pagar'}
              </p>
              <p
                className={`font-mono text-lg font-semibold tabular-nums ${
                  summary.fullyAssigned ? 'text-primary' : 'text-accent'
                }`}
              >
                {formatBRL(summary.remaining)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">Total</p>
              <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                {formatBRL(summary.grandTotal)}
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
