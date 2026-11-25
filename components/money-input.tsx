'use client'

import { cn } from '@/lib/utils'

type Props = {
  value: number
  onChange: (value: number) => void
  className?: string
  'aria-label'?: string
}

// Input que lê e escreve centavos de forma amigável (digita como calculadora).
export function MoneyInput({ value, onChange, className, ...rest }: Props) {
  const display = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    const cents = digits ? parseInt(digits, 10) : 0
    onChange(cents / 100)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg border border-input bg-background/60 px-2.5 py-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40',
        className,
      )}
    >
      <span className="text-sm text-muted-foreground">R$</span>
      <input
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        className="w-full bg-transparent text-right font-mono text-sm tabular-nums text-foreground outline-none"
        {...rest}
      />
    </div>
  )
}
