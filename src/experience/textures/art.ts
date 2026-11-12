import { canvasTexture, FONT, roundRect, seeded, speckle } from './canvas'

/** Retro sunburst poster with a programmer's greeting. Original artwork. */
export const posterHello = () =>
  canvasTexture(512, 720, (ctx, w, h) => {
    ctx.fillStyle = '#efe2c2'
    ctx.fillRect(0, 0, w, h)
    const bands = ['#7d3a20', '#b5532a', '#d98a3d', '#e2b65a', '#8a8f4d', '#5d6336']
    ctx.save()
    ctx.beginPath()
    ctx.rect(36, 36, w - 72, 430)
    ctx.clip()
    bands.forEach((color, i) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(w / 2, 470, 400 - i * 58, Math.PI, 0)
      ctx.fill()
    })
    ctx.fillStyle = '#efe2c2'
    ctx.beginPath()
    ctx.arc(w / 2, 470, 52, Math.PI, 0)
    ctx.fill()
    ctx.restore()
    ctx.fillStyle = '#2a2018'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = FONT.display(86, 700)
    ctx.fillText('HELLO,', w / 2, 540)
    ctx.fillText('WORLD', w / 2, 626)
    ctx.font = FONT.mono(20, 500)
    ctx.fillText('print("hello, world")', w / 2, 690)
    speckle(ctx, w, h, 1400, 3)
  })

/** Travel-style poster for the home city, with a simplified four-minaret monument. */
export const posterCity = () =>
  canvasTexture(512, 720, (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 520)
    sky.addColorStop(0, '#22406b')
    sky.addColorStop(0.6, '#c9764a')
    sky.addColorStop(1, '#e8b76a')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#f4dba0'
    ctx.beginPath()
    ctx.arc(w / 2, 330, 110, 0, Math.PI * 2)
    ctx.fill()
    // monument silhouette
    ctx.fillStyle = '#2b1b2e'
    const base = 520
    ctx.fillRect(150, 330, 212, base - 330)
    ;[150, 362].forEach((x) => {
      ctx.fillRect(x - 22, 200, 44, base - 200)
      ctx.beginPath()
      ctx.arc(x, 200, 26, Math.PI, 0)
      ctx.fill()
      ctx.fillRect(x - 3, 150, 6, 40)
      ctx.fillRect(x - 30, 270, 60, 10)
      ctx.fillRect(x - 30, 340, 60, 10)
    })
    ctx.fillStyle = '#e8b76a'
    ctx.beginPath()
    ctx.moveTo(206, base)
    ctx.lineTo(206, 440)
    ctx.quadraticCurveTo(256, 370, 306, 440)
    ctx.lineTo(306, base)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#2b1b2e'
    ctx.fillRect(0, base, w, 12)
    // text block
    ctx.fillStyle = '#efe2c2'
    ctx.fillRect(0, base + 12, w, h - base - 12)
    ctx.fillStyle = '#2a2018'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = FONT.display(70, 700)
    ctx.fillText('HYDERABAD', w / 2, 606)
    ctx.font = FONT.mono(21, 500)
    ctx.fillText('CITY OF PEARLS · CITY OF CODE', w / 2, 668)
    ctx.strokeStyle = '#efe2c2'
    ctx.lineWidth = 14
    ctx.strokeRect(7, 7, w - 14, h - 14)
    speckle(ctx, w, h, 1400, 6)
  })

type PhotoKind = 'skyline' | 'tape' | 'chip'

/** Instant-photo style illustrations. Decorative only: they are drawings, not real photos. */
export const photo = (kind: PhotoKind) =>
  canvasTexture(384, 448, (ctx, w, h) => {
    ctx.fillStyle = '#f3ecdc'
    ctx.fillRect(0, 0, w, h)
    const px = 26
    const py = 26
    const pw = w - 52
    const ph = 310
    ctx.save()
    ctx.beginPath()
    ctx.rect(px, py, pw, ph)
    ctx.clip()
    if (kind === 'skyline') {
      const g = ctx.createLinearGradient(0, py, 0, py + ph)
      g.addColorStop(0, '#2a3f73')
      g.addColorStop(0.7, '#d9895a')
      g.addColorStop(1, '#f0c97f')
      ctx.fillStyle = g
      ctx.fillRect(px, py, pw, ph)
      const rand = seeded(77)
      ctx.fillStyle = '#231a2c'
      for (let x = px; x < px + pw; x += 26 + rand() * 18) {
        const bh = 70 + rand() * 150
        ctx.fillRect(x, py + ph - bh, 22 + rand() * 16, bh)
      }
    } else if (kind === 'tape') {
      ctx.fillStyle = '#c9a36a'
      ctx.fillRect(px, py, pw, ph)
      ctx.fillStyle = '#231f1c'
      roundRect(ctx, px + 44, py + 82, pw - 88, 150, 12)
      ctx.fill()
      ctx.fillStyle = '#efe4c9'
      ctx.fillRect(px + 62, py + 98, pw - 124, 56)
      ctx.fillStyle = '#b5532a'
      ctx.fillRect(px + 62, py + 98, pw - 124, 16)
      ctx.fillStyle = '#e9e4d8'
      ctx.beginPath()
      ctx.arc(px + 120, py + 190, 22, 0, Math.PI * 2)
      ctx.arc(px + pw - 120, py + 190, 22, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = '#28493f'
      ctx.fillRect(px, py, pw, ph)
      ctx.strokeStyle = '#d7b66b'
      ctx.lineWidth = 4
      const rand = seeded(12)
      for (let i = 0; i < 16; i++) {
        const x = px + 20 + rand() * (pw - 40)
        const y = py + 20 + rand() * (ph - 40)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 50 - rand() * 100, y)
        ctx.lineTo(x + 50 - rand() * 100, y + 60 - rand() * 120)
        ctx.stroke()
        ctx.fillStyle = '#d7b66b'
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#16171a'
      roundRect(ctx, px + pw / 2 - 60, py + ph / 2 - 60, 120, 120, 8)
      ctx.fill()
    }
    // faded-print tint
    ctx.fillStyle = 'rgba(190,140,70,0.16)'
    ctx.fillRect(px, py, pw, ph)
    ctx.restore()
    ctx.fillStyle = '#3a3048'
    ctx.font = FONT.hand(36)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const caption = kind === 'skyline' ? 'home' : kind === 'tape' ? 'press play' : 'build things'
    ctx.fillText(caption, w / 2, 392)
  })

/** Fictional magazine covers for the bookshelf. */
export const magazine = (title: string, color: string, line: string) =>
  canvasTexture(384, 512, (ctx, w, h) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#f3e9cf'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = FONT.sans(64, 800)
    ctx.fillText(title, w / 2, 70)
    ctx.fillRect(30, 118, w - 60, 4)
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    roundRect(ctx, 60, 160, w - 120, 220, 10)
    ctx.fill()
    ctx.fillStyle = '#f3e9cf'
    ctx.fillRect(92, 196, w - 184, 120)
    ctx.fillStyle = color
    ctx.fillRect(106, 210, w - 212, 92)
    ctx.fillStyle = '#f3e9cf'
    ctx.fillRect(140, 330, w - 280, 24)
    ctx.font = FONT.mono(24, 600)
    ctx.fillText(line, w / 2, 440)
    speckle(ctx, w, h, 600, 21)
  })

/** Thin bands on book spines; the instance colour tints it. */
export const bookSpine = () =>
  canvasTexture(64, 256, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillRect(0, 26, w, 5)
    ctx.fillRect(0, 40, w, 2)
    ctx.fillRect(0, h - 44, w, 5)
    ctx.fillStyle = 'rgba(255,230,160,0.9)'
    ctx.fillRect(14, 86, w - 28, 54)
    const g = ctx.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0, 'rgba(0,0,0,0.22)')
    g.addColorStop(0.3, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.25)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })

/** Side of a metro car: light body, blue band, lit windows and doors. */
export const metroSide = () =>
  canvasTexture(1024, 176, (ctx, w, h) => {
    ctx.fillStyle = '#dfe5ea'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c9d1d8'
    ctx.fillRect(0, 0, w, 20)
    // blue waist band and skirt
    ctx.fillStyle = '#1f6fb5'
    ctx.fillRect(0, 118, w, 20)
    ctx.fillStyle = '#35a3d9'
    ctx.fillRect(0, 112, w, 6)
    ctx.fillStyle = '#3a3f47'
    ctx.fillRect(0, 150, w, 26)
    const doors = [128, 384, 640, 896]
    // window band
    ctx.fillStyle = '#10151c'
    ctx.fillRect(18, 36, w - 36, 64)
    ctx.fillStyle = '#ffe9b8'
    for (let x = 30; x < w - 60; x += 64) {
      ctx.fillRect(x, 42, 52, 52)
    }
    const glow = ctx.createLinearGradient(0, 42, 0, 94)
    glow.addColorStop(0, 'rgba(255,255,255,0.5)')
    glow.addColorStop(1, 'rgba(255,190,110,0.25)')
    ctx.fillStyle = glow
    ctx.fillRect(18, 42, w - 36, 52)
    doors.forEach((x) => {
      ctx.fillStyle = '#eef2f5'
      ctx.fillRect(x - 44, 26, 88, 124)
      ctx.fillStyle = '#10151c'
      ctx.fillRect(x - 36, 36, 32, 70)
      ctx.fillRect(x + 4, 36, 32, 70)
      ctx.fillStyle = '#fff0cc'
      ctx.fillRect(x - 33, 39, 26, 64)
      ctx.fillRect(x + 7, 39, 26, 64)
      ctx.fillStyle = '#9aa3ab'
      ctx.fillRect(x - 1, 26, 2, 124)
      ctx.fillStyle = '#1f6fb5'
      ctx.fillRect(x - 44, 118, 88, 20)
    })
  })

/** Cab end of a metro car. */
export const metroFront = () =>
  canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#dfe5ea'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#0d1218'
    roundRect(ctx, 22, 26, w - 44, 120, 22)
    ctx.fill()
    ctx.fillStyle = '#ffb347'
    ctx.fillRect(70, 34, w - 140, 16)
    ctx.fillStyle = '#1f6fb5'
    ctx.fillRect(0, 168, w, 30)
    ctx.fillStyle = '#3a3f47'
    ctx.fillRect(0, 218, w, 38)
    ctx.fillStyle = '#fffbe8'
    ctx.beginPath()
    ctx.arc(50, 184, 13, 0, Math.PI * 2)
    ctx.arc(w - 50, 184, 13, 0, Math.PI * 2)
    ctx.fill()
  })
