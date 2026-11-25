import { generateText, Output } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export const maxDuration = 60

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const schema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().describe('Nome do item consumido, em português'),
        quantity: z
          .number()
          .describe('Quantidade do item. Use 1 se não estiver claro.'),
        unitPrice: z
          .number()
          .describe('Preço UNITÁRIO em reais (não o total da linha).'),
      }),
    )
    .describe('Lista de itens consumidos na comanda'),
  detectedServicePct: z
    .number()
    .nullable()
    .describe(
      'Percentual da taxa de serviço/garçom se aparecer na comanda (ex.: 10). null se não houver.',
    ),
  detectedCouvertPerPerson: z
    .number()
    .nullable()
    .describe(
      'Valor do couvert artístico por pessoa em reais, se aparecer. null se não houver.',
    ),
})

export async function POST(req: Request) {
  try {
    const { image, mediaType } = (await req.json()) as {
      image?: string
      mediaType?: string
    }

    if (!image) {
      return Response.json({ error: 'Imagem não enviada.' }, { status: 400 })
    }

    const supported = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const resolvedMediaType = (mediaType || 'image/jpeg').toLowerCase()
    if (!supported.includes(resolvedMediaType)) {
      return Response.json(
        {
          error:
            'Formato de imagem não suportado. Tente tirar uma nova foto (JPG ou PNG).',
        },
        { status: 415 },
      )
    }

    const base64 = image.includes(',') ? image.split(',')[1] : image

    const { output } = await generateText({
      model: anthropic('claude-sonnet-4-5'),
      output: Output.object({ schema }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: [
                'Você é um leitor de comandas/contas de bares e restaurantes brasileiros.',
                'Extraia TODOS os itens de consumo da imagem desta comanda.',
                'Regras:',
                '- unitPrice deve ser o preço UNITÁRIO. Se a comanda mostrar o total da linha e a quantidade, divida para obter o unitário.',
                '- Ignore linhas de subtotal, total geral, troco e formas de pagamento.',
                '- Não invente itens. Se um preço estiver ilegível, faça a melhor estimativa possível.',
                '- Se houver taxa de serviço (ex.: 10%) informe em detectedServicePct.',
                '- Se houver couvert artístico por pessoa, informe em detectedCouvertPerPerson.',
              ].join('\n'),
            },
            {
              type: 'file',
              mediaType: resolvedMediaType,
              data: base64,
            },
          ],
        },
      ],
    })

    return Response.json(output)
  } catch (err) {
    console.error('[v0] scan error:', err)
    return Response.json(
      { error: 'Não consegui ler a comanda. Tente uma foto mais nítida.' },
      { status: 500 },
    )
  }
}
