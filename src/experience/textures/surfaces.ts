import { canvasTexture, seeded } from './canvas'

/** Pale, tintable wood grain. Materials multiply it by their own colour. */
export const woodGrain = (repeat: [number, number] = [1, 1], seed = 11) =>
  canvasTexture(
    512,
    512,
    (ctx, w, h) => {
      const rand = seeded(seed)
      ctx.fillStyle = '#d8c3a4'
      ctx.fillRect(0, 0, w, h)
      // Broad tonal bands.
      for (let i = 0; i < 26; i++) {
        const y = rand() * h
        const band = 8 + rand() * 40
        ctx.fillStyle = `rgba(${rand() > 0.5 ? '120,80,40' : '255,240,215'},${0.04 + rand() * 0.07})`
        ctx.fillRect(0, y, w, band)
        ctx.fillRect(0, y - h, w, band)
      }
      // Fine grain lines that tile horizontally.
      for (let i = 0; i < 260; i++) {
        const y = rand() * h
        const amp = 1 + rand() * 5
        const freq = (Math.PI * 2 * (1 + Math.floor(rand() * 3))) / w
        const phase = rand() * Math.PI * 2
        ctx.strokeStyle = `rgba(70,40,15,${0.05 + rand() * 0.16})`
        ctx.lineWidth = 0.5 + rand() * 1.6
        ctx.beginPath()
        for (let x = 0; x <= w; x += 8) {
          const yy = y + Math.sin(x * freq + phase) * amp
          if (x === 0) ctx.moveTo(x, yy)
          else ctx.lineTo(x, yy)
        }
        ctx.stroke()
      }
    },
    { repeat },
  )

/** Wooden floor boards. */
export const floorPlanks = () =>
  canvasTexture(
    1024,
    1024,
    (ctx, w, h) => {
      const rand = seeded(23)
      const rows = 8
      const rowH = h / rows
      const tones = ['#8a5a36', '#7c4f2e', '#94623c', '#84552f', '#8f5d37', '#774a2a']
      for (let r = 0; r < rows; r++) {
        let x = -rand() * 300
        while (x < w) {
          const len = 260 + rand() * 280
          ctx.fillStyle = tones[Math.floor(rand() * tones.length)]
          ctx.fillRect(x, r * rowH, len, rowH)
          // grain
          for (let i = 0; i < 26; i++) {
            const y = r * rowH + rand() * rowH
            ctx.strokeStyle = `rgba(45,22,8,${0.05 + rand() * 0.13})`
            ctx.lineWidth = 0.6 + rand() * 1.4
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.bezierCurveTo(x + len * 0.3, y + rand() * 6 - 3, x + len * 0.7, y + rand() * 6 - 3, x + len, y)
            ctx.stroke()
          }
          // board end
          ctx.fillStyle = 'rgba(25,12,5,0.55)'
          ctx.fillRect(x + len - 2, r * rowH, 3, rowH)
          x += len
        }
        ctx.fillStyle = 'rgba(25,12,5,0.6)'
        ctx.fillRect(0, r * rowH, w, 3)
      }
      // gentle sheen variation
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, 'rgba(255,220,170,0.05)')
      g.addColorStop(1, 'rgba(0,0,0,0.08)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    },
    { repeat: [2.6, 2] },
  )

/** Cream wallpaper with a quiet period pattern. */
export const wallpaper = () =>
  canvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#e3d3ae'
      ctx.fillRect(0, 0, w, h)
      for (let x = 0; x < w; x += 64) {
        ctx.fillStyle = 'rgba(190,160,110,0.16)'
        ctx.fillRect(x, 0, 30, h)
        ctx.fillStyle = 'rgba(150,120,70,0.2)'
        ctx.fillRect(x + 30, 0, 1.5, h)
        ctx.fillRect(x, 0, 1.5, h)
      }
      ctx.fillStyle = 'rgba(140,105,60,0.24)'
      for (let y = 0; y < h; y += 64) {
        for (let x = 0; x < w; x += 64) {
          ctx.save()
          ctx.translate(x + 47, y + 32 + ((x / 64) % 2) * 32)
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(-5, -5, 10, 10)
          ctx.restore()
        }
      }
      const rand = seeded(5)
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(110,80,40,${rand() * 0.05})`
        ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5)
      }
    },
    { repeat: [9, 3.4] },
  )

/** Retro patterned rug. */
export const rug = () =>
  canvasTexture(768, 512, (ctx, w, h) => {
    ctx.fillStyle = '#7d3a20'
    ctx.fillRect(0, 0, w, h)
    const frame = (inset: number, color: string, width: number) => {
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2)
    }
    frame(18, '#e2cfa3', 10)
    frame(40, '#5d6336', 16)
    frame(62, '#e2cfa3', 4)
    ctx.fillStyle = '#93492a'
    ctx.fillRect(74, 74, w - 148, h - 148)
    // diamond lattice
    const step = 64
    for (let y = 74; y < h - 74; y += step) {
      for (let x = 74; x < w - 74; x += step) {
        const cx = x + step / 2
        const cy = y + step / 2
        ctx.fillStyle = ((x + y) / step) % 2 === 0 ? '#e2cfa3' : '#5d6336'
        ctx.beginPath()
        ctx.moveTo(cx, cy - 20)
        ctx.lineTo(cx + 20, cy)
        ctx.lineTo(cx, cy + 20)
        ctx.lineTo(cx - 20, cy)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#3a2415'
        ctx.beginPath()
        ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // woven texture
    const rand = seeded(31)
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(${rand() > 0.5 ? '0,0,0' : '255,230,190'},${rand() * 0.07})`
      ctx.fillRect(rand() * w, rand() * h, 3, 1)
    }
  })

/** Dotted speaker cloth. */
export const speakerGrille = () =>
  canvasTexture(
    64,
    64,
    (ctx, w, h) => {
      ctx.fillStyle = '#1b1612'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#3b3027'
      for (let y = 4; y < h; y += 8) {
        for (let x = 4 + ((y / 8) % 2) * 4; x < w; x += 8) {
          ctx.beginPath()
          ctx.arc(x, y, 1.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    { repeat: [5, 8] },
  )

/** Soft round glow used for hint markers and lamp halos. */
export const glowSprite = () =>
  canvasTexture(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.25, 'rgba(255,255,255,0.55)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.12)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })

/** Ring-and-dot marker that hints at interactive objects. */
export const hintSprite = () =>
  canvasTexture(128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 26)
    g.addColorStop(0, 'rgba(255,236,200,1)')
    g.addColorStop(0.45, 'rgba(255,214,150,0.9)')
    g.addColorStop(1, 'rgba(255,200,120,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, 26, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,226,180,0.85)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2)
    ctx.stroke()
  })
