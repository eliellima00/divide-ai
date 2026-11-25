'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { BillState, CouvertMode, Item, ScannedItem } from './types'

const STORAGE_KEY = 'racha:bill:v1'

const EMPTY: BillState = {
  people: [],
  items: [],
  config: {
    servicePct: 10,
    couvertMode: 'none',
    couvertValue: 0,
  },
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function useBill() {
  const [state, setState] = useState<BillState>(EMPTY)
  const [hydrated, setHydrated] = useState(false)
  const firstSave = useRef(true)

  // Carrega do localStorage (offline).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState(JSON.parse(raw) as BillState)
    } catch {
      // ignora
    }
    setHydrated(true)
  }, [])

  // Persiste em toda alteração.
  useEffect(() => {
    if (!hydrated) return
    if (firstSave.current) {
      firstSave.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignora
    }
  }, [state, hydrated])

  const reset = useCallback(() => {
    setState(EMPTY)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignora
    }
  }, [])

  // ----- Pessoas -----
  const addPerson = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setState((s) => ({
      ...s,
      people: [...s.people, { id: uid(), name: trimmed }],
    }))
  }, [])

  const renamePerson = useCallback((id: string, name: string) => {
    setState((s) => ({
      ...s,
      people: s.people.map((p) => (p.id === id ? { ...p, name } : p)),
    }))
  }, [])

  const removePerson = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      people: s.people.filter((p) => p.id !== id),
      items: s.items.map((it) => ({
        ...it,
        payers: it.payers.filter((pid) => pid !== id),
      })),
    }))
  }, [])

  // ----- Itens -----
  const addItem = useCallback((partial?: Partial<Item>) => {
    const item: Item = {
      id: uid(),
      name: partial?.name ?? '',
      quantity: partial?.quantity ?? 1,
      unitPrice: partial?.unitPrice ?? 0,
      payers: partial?.payers ?? [],
    }
    setState((s) => ({ ...s, items: [...s.items, item] }))
    return item.id
  }, [])

  const setItemsFromScan = useCallback((scanned: ScannedItem[]) => {
    setState((s) => ({
      ...s,
      items: [
        ...s.items,
        ...scanned.map((si) => ({
          id: uid(),
          name: si.name,
          quantity: si.quantity > 0 ? si.quantity : 1,
          unitPrice: si.unitPrice >= 0 ? si.unitPrice : 0,
          payers: [] as string[],
        })),
      ],
    }))
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<Item>) => {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))
  }, [])

  const removeItem = useCallback((id: string) => {
    setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }))
  }, [])

  const togglePayer = useCallback((itemId: string, personId: string) => {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => {
        if (it.id !== itemId) return it
        const has = it.payers.includes(personId)
        return {
          ...it,
          payers: has
            ? it.payers.filter((p) => p !== personId)
            : [...it.payers, personId],
        }
      }),
    }))
  }, [])

  const setItemPayers = useCallback((itemId: string, payers: string[]) => {
    setState((s) => ({
      ...s,
      items: s.items.map((it) => (it.id === itemId ? { ...it, payers } : it)),
    }))
  }, [])

  // ----- Config -----
  const setServicePct = useCallback((pct: number) => {
    setState((s) => ({ ...s, config: { ...s.config, servicePct: pct } }))
  }, [])

  const setCouvert = useCallback((mode: CouvertMode, value: number) => {
    setState((s) => ({
      ...s,
      config: { ...s.config, couvertMode: mode, couvertValue: value },
    }))
  }, [])

  return {
    state,
    hydrated,
    reset,
    addPerson,
    renamePerson,
    removePerson,
    addItem,
    setItemsFromScan,
    updateItem,
    removeItem,
    togglePayer,
    setItemPayers,
    setServicePct,
    setCouvert,
  }
}

export type UseBill = ReturnType<typeof useBill>
