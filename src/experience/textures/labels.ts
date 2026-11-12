import type { TapeDef } from '../../data/types'
import { profile } from '../../data/profile'
import { canvasTexture, fitText, FONT, roundRect, seeded, speckle } from './canvas'

/** Front face of a VHS cassette: sticker label above the reel window. */
export const tapeFront = (tape: TapeDef, index: number) =>
  canvasTexture(1024, 564, (ctx, w, h) => {
    // moulded black shell
    ctx.fillStyle = '#161514'
    ctx.fillRect(0, 0, w, h)
    const rand = seeded(100 + index)
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = `rgba(255,255,255,${rand() * 0.035})`
      ctx.fillRect(rand() * w, rand() * h, 2, 2)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 6
    roundRect(ctx, 14, 14, w - 28, h - 28, 22)
    ctx.stroke()
    // ribbed grip strips left and right
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    for (let i = 0; i < 9; i++) {
      ctx.fillRect(34, 340 + i * 20, 70, 9)
      ctx.fillRect(w - 104, 340 + i * 20, 70, 9)
    }

    // sticker label
    const lx = 60
    const ly = 46
    const lw = w - 120
    const lh = 250
    ctx.fillStyle = tape.paper
    roundRect(ctx, lx, ly, lw, lh, 12)
    ctx.fill()
    ctx.save()
    roundRect(ctx, lx, ly, lw, lh, 12)
    ctx.clip()
    // colour stripes along the bottom of the label
    ctx.fillStyle = tape.color
    ctx.fillRect(lx, ly + lh - 62, lw, 62)
    ctx.globalAlpha = 0.55
    ctx.fillRect(lx, ly + lh - 80, lw, 9)
    ctx.globalAlpha = 0.3
    ctx.fillRect(lx, ly + lh - 96, lw, 6)
    ctx.globalAlpha = 1
    // tape number block
    ctx.fillStyle = tape.color
    ctx.fillRect(lx, ly, 128, lh - 96)
    ctx.fillStyle = tape.paper
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = FONT.display(92, 700)
    ctx.fillText(String(index + 1).padStart(2, '0'), lx + 64, ly + (lh - 96) / 2 + 4)
    // title
    ctx.fillStyle = '#231a12'
    ctx.textAlign = 'left'
    const titleMax = lw - 128 - 56
    fitText(ctx, tape.label, titleMax, 108, (s) => FONT.sans(s, 800))
    ctx.fillText(tape.label, lx + 128 + 28, ly + (lh - 96) / 2 + 6)
    // catalogue line on the stripe
    ctx.fillStyle = tape.paper
    fitText(ctx, tape.sub, lw - 60, 34, (s) => FONT.mono(s, 600))
    ctx.fillText(tape.sub, lx + 28, ly + lh - 30)
    speckle(ctx, w, h, 500, 40 + index)
    ctx.restore()

    // reel window
    const wx = 190
    const wy = 332
    const ww = w - 380
    const wh = 176
    ctx.fillStyle = '#070707'
    roundRect(ctx, wx, wy, ww, wh, 18)
    ctx.fill()
    ctx.save()
    roundRect(ctx, wx, wy, ww, wh, 18)
    ctx.clip()
    const reel = (cx: number, tapeRadius: number) => {
      ctx.fillStyle = '#2a1d14'
      ctx.beginPath()
      ctx.arc(cx, wy + wh / 2, tapeRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#e9e4d8'
      ctx.beginPath()
      ctx.arc(cx, wy + wh / 2, 46, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#0c0c0c'
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(cx + Math.cos(a) * 26, wy + wh / 2 + Math.sin(a) * 26, 7, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(cx, wy + wh / 2, 12, 0, Math.PI * 2)
      ctx.fill()
    }
    reel(wx + 130, 120)
    reel(wx + ww - 130, 82)
    const sheen = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh)
    sheen.addColorStop(0, 'rgba(255,255,255,0.14)')
    sheen.addColorStop(0.4, 'rgba(255,255,255,0.02)')
    sheen.addColorStop(1, 'rgba(255,255,255,0.08)')
    ctx.fillStyle = sheen
    ctx.fillRect(wx, wy, ww, wh)
    ctx.restore()

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = FONT.mono(22, 500)
    ctx.textAlign = 'left'
    ctx.fillText('T-120', 40, h - 34)
    ctx.textAlign = 'right'
    ctx.fillText('VIDEO CASSETTE', w - 40, h - 34)
  })

/** Spine label: the edge that faces out of the VCR slot. */
export const tapeSpine = (tape: TapeDef, index: number) =>
  canvasTexture(1024, 138, (ctx, w, h) => {
    ctx.fillStyle = '#161514'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = tape.paper
    roundRect(ctx, 46, 16, w - 92, h - 32, 8)
    ctx.fill()
    ctx.fillStyle = tape.color
    ctx.fillRect(46, 16, 150, h - 32)
    ctx.fillRect(w - 46 - 26, 16, 26, h - 32)
    ctx.fillStyle = tape.paper
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = FONT.display(70, 700)
    ctx.fillText(String(index + 1).padStart(2, '0'), 121, h / 2 + 4)
    ctx.fillStyle = '#231a12'
    ctx.textAlign = 'left'
    fitText(ctx, tape.label, w - 330, 78, (s) => FONT.sans(s, 800))
    ctx.fillText(tape.label, 224, h / 2 + 4)
  })

/** Small audio cassette label. */
export const cassetteLabel = (title: string, color: string) =>
  canvasTexture(256, 160, (ctx, w, h) => {
    ctx.fillStyle = '#2a2622'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#efe4c9'
    roundRect(ctx, 14, 12, w - 28, 92, 6)
    ctx.fill()
    ctx.fillStyle = color
    ctx.fillRect(14, 12, w - 28, 22)
    ctx.fillStyle = '#2a2018'
    ctx.font = FONT.hand(34)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(title, 26, 72)
    ctx.fillStyle = '#0d0c0b'
    roundRect(ctx, 62, 112, w - 124, 36, 8)
    ctx.fill()
    ctx.fillStyle = '#d8d2c4'
    ctx.beginPath()
    ctx.arc(96, 130, 11, 0, Math.PI * 2)
    ctx.arc(w - 96, 130, 11, 0, Math.PI * 2)
    ctx.fill()
  })

/** Wall clock face (hands are real geometry). */
export const clockFace = () =>
  canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f1e7cf'
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.translate(w / 2, h / 2)
    for (let i = 0; i < 60; i++) {
      const major = i % 5 === 0
      ctx.save()
      ctx.rotate((i / 60) * Math.PI * 2)
      ctx.fillStyle = '#2a2018'
      ctx.fillRect(-(major ? 4 : 1.5), -232, major ? 8 : 3, major ? 30 : 14)
      ctx.restore()
    }
    ctx.fillStyle = '#2a2018'
    ctx.font = FONT.display(64, 600)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ;[12, 3, 6, 9].forEach((n, i) => {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 2
      ctx.fillText(String(n), Math.cos(a) * 160, Math.sin(a) * 160 + 4)
    })
    ctx.fillStyle = '#8a6a3a'
    ctx.font = FONT.mono(20, 500)
    ctx.fillText('QUARTZ', 0, 76)
  })

/** Rotary dial numbers for the telephone. */
export const phoneDial = () =>
  canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#e9dfc6'
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2a2018'
    ctx.font = FONT.sans(26, 700)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    digits.forEach((d, i) => {
      const a = -Math.PI / 3 - (i / 10) * Math.PI * 1.6
      ctx.fillText(d, w / 2 + Math.cos(a) * 92, h / 2 + Math.sin(a) * 92)
    })
    ctx.fillStyle = '#cfc3a5'
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, 46, 0, Math.PI * 2)
    ctx.fill()
  })

/** Open notebook spread with handwriting. */
export const notebookPages = () =>
  canvasTexture(1024, 720, (ctx, w, h) => {
    ctx.fillStyle = '#f4ecd6'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(70,110,160,0.35)'
    ctx.lineWidth = 2
    for (let y = 110; y < h - 30; y += 46) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(190,70,60,0.45)'
    ctx.beginPath()
    ctx.moveTo(90, 0)
    ctx.lineTo(90, h)
    ctx.moveTo(w / 2 + 90, 0)
    ctx.lineTo(w / 2 + 90, h)
    ctx.stroke()
    // gutter
    const g = ctx.createLinearGradient(w / 2 - 50, 0, w / 2 + 50, 0)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(0.5, 'rgba(60,40,20,0.35)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(w / 2 - 50, 0, 100, h)

    ctx.fillStyle = '#2b2a55'
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.font = FONT.hand(58)
    ctx.fillText('Notes', 110, 92)
    ctx.font = FONT.hand(40, 400)
    const left = ['ideas -> working apps', 'ask the data first', 'python + sql + ai', 'keep learning']
    left.forEach((line, i) => ctx.fillText(line, 110, 196 + i * 92))
    ctx.font = FONT.hand(58)
    ctx.fillText(`Hello, I am ${profile.shortName}.`, w / 2 + 108, 92)
    ctx.font = FONT.hand(40, 400)
    const right = ['(click to read)', '', 'pick a tape,', 'press play']
    right.forEach((line, i) => ctx.fillText(line, w / 2 + 108, 196 + i * 92))
    speckle(ctx, w, h, 700, 9)
  })

/** Idle screen of the vintage computer. */
export const computerIdle = () =>
  canvasTexture(512, 384, (ctx, w, h) => {
    ctx.fillStyle = '#041007'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#7dff8a'
    ctx.font = FONT.crt(40)
    ctx.textBaseline = 'top'
    const lines = ['VIVEK-PC  64K RAM SYSTEM', 'READY.', '', 'C:\\> DIR', ' SKILLS   EXE', ' PROJECTS DIR', '', 'C:\\> RUN SKILLS.EXE_']
    lines.forEach((line, i) => ctx.fillText(line, 26, 22 + i * 42))
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1.5)
  })

/** Sheet of paper in the typewriter. */
export const typedSheet = () =>
  canvasTexture(512, 660, (ctx, w, h) => {
    ctx.fillStyle = '#f6f0df'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2a2420'
    ctx.font = FONT.mono(26, 500)
    ctx.textBaseline = 'top'
    const lines = ['def build(idea):', '    plan = think(idea)', '    app = code(plan)', '    return ship(app)', '', '# yesterday\u2019s tools,', '# tomorrow\u2019s ideas']
    lines.forEach((line, i) => ctx.fillText(line, 44, 380 + i * 36))
    speckle(ctx, w, h, 300, 4)
  })

/** Keyboard key legends, drawn as one texture for the key block. */
export const mugLabel = () =>
  canvasTexture(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#b5532a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#f1e6d0'
    ctx.fillRect(0, 40, w, 14)
    ctx.fillStyle = '#5d6336'
    ctx.fillRect(0, 62, w, 8)
  })
