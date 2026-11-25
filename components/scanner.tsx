'use client'

import { useRef, useState } from 'react'
import { Camera, ImageIcon, LoaderCircle, PencilLine, ScanText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ScanResult, ScannedItem } from '@/lib/types'

type Props = {
  onScanned: (
    items: ScannedItem[],
    detected: { servicePct: number | null; couvertPerPerson: number | null },
  ) => void
  onManual: () => void
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Redimensiona e reconverte a foto para JPEG no navegador.
// Isso normaliza formatos (inclusive HEIC do iPhone, decodificado pelo
// navegador) e reduz drasticamente o tamanho antes de enviar à IA.
async function compressImage(
  file: File,
  maxSide = 1600,
  quality = 0.82,
): Promise<{ dataUrl: string; mediaType: string }> {
  const dataUrl = await readAsDataUrl(file)

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })

  const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    // Sem canvas disponível: usa o arquivo original.
    return { dataUrl, mediaType: file.type || 'image/jpeg' }
  }
  ctx.drawImage(img, 0, 0, width, height)

  const compressed = canvas.toDataURL('image/jpeg', quality)
  return { dataUrl: compressed, mediaType: 'image/jpeg' }
}

export function Scanner({ onScanned, onManual }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    try {
      const { dataUrl, mediaType } = await compressImage(file)
      setPreview(dataUrl)

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, mediaType }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao ler a comanda.')
      }

      const data = (await res.json()) as ScanResult
      if (!data.items || data.items.length === 0) {
        throw new Error(
          'Não encontrei itens na foto. Tente novamente ou adicione manualmente.',
        )
      }

      onScanned(data.items, {
        servicePct: data.detectedServicePct,
        couvertPerPerson: data.detectedCouvertPerPerson,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ler a comanda.')
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="aspect-[4/5] w-full">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview || '/placeholder.svg'}
              alt="Prévia da comanda enviada"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <ScanText className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="text-pretty font-medium text-foreground">
                  Fotografe a comanda final
                </p>
                <p className="text-pretty text-sm text-muted-foreground">
                  A IA lê os itens e preços automaticamente. Depois é só cada um
                  marcar o que consumiu.
                </p>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            <LoaderCircle className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              Lendo a comanda...
            </p>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="h-12 text-base"
          disabled={loading}
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="size-5" />
          Tirar foto da comanda
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-11"
          disabled={loading}
          onClick={() => galleryRef.current?.click()}
        >
          <ImageIcon className="size-4" />
          Escolher da galeria
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="h-11 text-muted-foreground"
          disabled={loading}
          onClick={onManual}
        >
          <PencilLine className="size-4" />
          Adicionar itens manualmente
        </Button>
      </div>
    </div>
  )
}
