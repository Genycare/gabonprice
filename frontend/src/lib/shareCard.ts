import { initials } from './format'

export interface ShareCardData {
  username: string
  level: string
  karma: number
  priceCount?: number
}

export type ShareResult = { status: 'shared' } | { status: 'cancelled' } | { status: 'fallback'; whatsappUrl: string }

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1500

// Hardcoded mirrors of index.css @theme tokens — canvas can't read CSS custom properties.
const COLORS = {
  brandGreen: '#157347',
  brandBlue: '#1e3a8a',
  brandGold: '#fcd34d',
  white: '#ffffff',
  goldText: '#78350F',
}

const FONT = (weight: number, size: number) => `${weight} ${size}px system-ui, "Segoe UI", Roboto, sans-serif`

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawStat(ctx: CanvasRenderingContext2D, x: number, y: number, value: string, label: string) {
  ctx.font = FONT(700, 68)
  ctx.fillStyle = COLORS.white
  ctx.fillText(value, x, y)
  ctx.font = FONT(500, 32)
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText(label, x, y + 44)
}

export async function generateShareCardBlob(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non supporté')

  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  bg.addColorStop(0, COLORS.brandGreen)
  bg.addColorStop(1, COLORS.brandBlue)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.textAlign = 'center'

  ctx.font = FONT(700, 56)
  ctx.fillStyle = COLORS.white
  ctx.fillText('GabonPrice', CANVAS_WIDTH / 2, 180)

  ctx.beginPath()
  ctx.arc(CANVAS_WIDTH / 2, 620, 140, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fill()
  ctx.fillStyle = COLORS.white
  ctx.font = FONT(700, 96)
  ctx.fillText(initials(data.username), CANVAS_WIDTH / 2, 655)

  ctx.font = FONT(700, 64)
  ctx.fillText(data.username, CANVAS_WIDTH / 2, 860)

  ctx.fillStyle = COLORS.brandGold
  roundRect(ctx, CANVAS_WIDTH / 2 - 200, 910, 400, 90, 45)
  ctx.fill()
  ctx.fillStyle = COLORS.goldText
  ctx.font = FONT(700, 42)
  ctx.fillText(`⭐ ${data.level}`, CANVAS_WIDTH / 2, 968)

  if (data.priceCount != null) {
    drawStat(ctx, CANVAS_WIDTH / 2 - 220, 1160, String(data.karma), 'Karma')
    drawStat(ctx, CANVAS_WIDTH / 2 + 220, 1160, String(data.priceCount), 'Prix publiés')
  } else {
    drawStat(ctx, CANVAS_WIDTH / 2, 1160, String(data.karma), 'Karma')
  }

  // Un seul emoji à point de code unique (📍) plutôt qu'un drapeau (séquence à deux
  // indicateurs régionaux) : le rendu canvas ne compose pas fiablement les drapeaux
  // selon les polices système disponibles, contrairement au texte DOM normal.
  ctx.font = FONT(600, 36)
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillText('📍 Comparez les prix au Gabon', CANVAS_WIDTH / 2, 1370)
  ctx.font = FONT(400, 30)
  ctx.fillText(window.location.origin.replace(/^https?:\/\//, ''), CANVAS_WIDTH / 2, 1420)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Échec de génération de la carte'))), 'image/png')
  })
}

export async function shareCard(data: ShareCardData): Promise<ShareResult> {
  const blob = await generateShareCardBlob(data)
  const file = new File([blob], 'gabonprice-carte.png', { type: 'image/png' })
  const caption = `Je suis ${data.level} sur GabonPrice avec ${data.karma} points de karma ! 🇬🇦 Rejoignez-moi : ${window.location.origin}`

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'GabonPrice', text: caption })
      return { status: 'shared' }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return { status: 'cancelled' }
      // real failure (not a user cancellation) → fall through to the fallback below
    }
  }

  // No reliable navigator.share support: download the PNG (safe, never popup-blocked)
  // and hand back a WhatsApp link for the caller to render as a real <a> tag —
  // calling window.open() here would happen after an await, which some browsers
  // silently popup-block, defeating the point of a fallback.
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gabonprice-carte.png'
  a.click()
  URL.revokeObjectURL(url)
  return { status: 'fallback', whatsappUrl: `https://wa.me/?text=${encodeURIComponent(caption)}` }
}
