'use client'

import { useState } from 'react'
import { Plus, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Person } from '@/lib/types'

type Props = {
  people: Person[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
}

const PALETTE = [
  'bg-chart-1/20 text-chart-1',
  'bg-chart-2/20 text-chart-2',
  'bg-chart-3/20 text-chart-3',
  'bg-chart-4/20 text-chart-4',
  'bg-chart-5/20 text-chart-5',
]

export function personColor(index: number) {
  return PALETTE[index % PALETTE.length]
}

export function PeopleManager({ people, onAdd, onRemove }: Props) {
  const [name, setName] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.isComposing) {
      return
    }
    onAdd(name)
    setName('')
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Users className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Quem está na mesa
        </span>
        <span className="ml-auto font-mono text-sm text-muted-foreground">
          {people.length}
        </span>
      </div>

      {people.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {people.map((p, i) => (
            <span
              key={p.id}
              className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-sm font-medium ${personColor(i)}`}
            >
              {p.name}
              <button
                type="button"
                aria-label={`Remover ${p.name}`}
                onClick={() => onRemove(p.id)}
                className="flex size-4 items-center justify-center rounded-full bg-foreground/10 hover:bg-foreground/20"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da pessoa"
          className="h-9 flex-1 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/40"
        />
        <Button type="submit" size="icon-lg" aria-label="Adicionar pessoa">
          <Plus className="size-4" />
        </Button>
      </form>
    </div>
  )
}
