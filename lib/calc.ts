import type { BillState, Item } from './types'

export function itemTotal(item: Item): number {
  return item.quantity * item.unitPrice
}

export function itemIsAssigned(item: Item): boolean {
  return item.payers.length > 0
}

// Quanto do item ainda não foi atribuído a ninguém (em R$).
export function itemUnassignedValue(item: Item): number {
  return item.payers.length === 0 ? itemTotal(item) : 0
}

// Consumo (sem taxa/couvert) de uma pessoa em um item específico.
export function personItemValue(item: Item, personId: string): number {
  if (!item.payers.includes(personId)) return 0
  return itemTotal(item) / item.payers.length
}

export type PersonBreakdown = {
  personId: string
  consumo: number
  taxa: number
  couvert: number
  total: number
}

export function personBreakdown(state: BillState, personId: string): PersonBreakdown {
  const consumo = state.items.reduce(
    (sum, item) => sum + personItemValue(item, personId),
    0,
  )
  const taxa = consumo * (state.config.servicePct / 100)

  let couvert = 0
  const n = state.people.length || 1
  if (state.config.couvertMode === 'perPerson') {
    couvert = state.config.couvertValue
  } else if (state.config.couvertMode === 'split') {
    couvert = state.config.couvertValue / n
  }

  return {
    personId,
    consumo,
    taxa,
    couvert,
    total: consumo + taxa + couvert,
  }
}

export type BillSummary = {
  itemsSubtotal: number // soma de todos os itens
  serviceTotal: number // taxa sobre todos os itens
  couvertTotal: number // couvert somado de todas as pessoas
  grandTotal: number // total geral da conta
  assignedConsumo: number // consumo já atribuído
  assignedTotal: number // total já coberto pelas pessoas
  remaining: number // quanto ainda falta pagar
  fullyAssigned: boolean
}

export function billSummary(state: BillState): BillSummary {
  const itemsSubtotal = state.items.reduce((s, i) => s + itemTotal(i), 0)
  const serviceTotal = itemsSubtotal * (state.config.servicePct / 100)

  const n = state.people.length
  let couvertTotal = 0
  if (state.config.couvertMode === 'perPerson') {
    couvertTotal = state.config.couvertValue * n
  } else if (state.config.couvertMode === 'split') {
    couvertTotal = n > 0 ? state.config.couvertValue : 0
  }

  const grandTotal = itemsSubtotal + serviceTotal + couvertTotal

  const assignedConsumo = state.items.reduce(
    (s, i) => s + (itemIsAssigned(i) ? itemTotal(i) : 0),
    0,
  )
  const assignedTotal = state.people.reduce(
    (s, p) => s + personBreakdown(state, p.id).total,
    0,
  )

  const remaining = Math.max(0, grandTotal - assignedTotal)

  return {
    itemsSubtotal,
    serviceTotal,
    couvertTotal,
    grandTotal,
    assignedConsumo,
    assignedTotal,
    remaining,
    fullyAssigned: remaining < 0.005 && state.items.length > 0,
  }
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(value) ? value : 0)
}
