export type CouvertMode = 'none' | 'perPerson' | 'split'

export type Person = {
  id: string
  name: string
}

export type Item = {
  id: string
  name: string
  quantity: number
  unitPrice: number
  // Ids das pessoas que vão pagar este item. O valor é dividido
  // igualmente entre elas. Vazio = ninguém escolheu ainda.
  payers: string[]
}

export type BillConfig = {
  servicePct: number // taxa do garçom em % (ex.: 10)
  couvertMode: CouvertMode
  couvertValue: number // valor por pessoa (perPerson) ou total (split)
}

export type BillState = {
  people: Person[]
  items: Item[]
  config: BillConfig
}

// Resultado do extrator de IA.
export type ScannedItem = {
  name: string
  quantity: number
  unitPrice: number
}

export type ScanResult = {
  items: ScannedItem[]
  detectedServicePct: number | null
  detectedCouvertPerPerson: number | null
}
