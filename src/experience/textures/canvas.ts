import * as THREE from 'three'

/** Small deterministic random generator so the room looks the same on every visit. */
export const seeded = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

interface Options {
  repeat?: [number, number]
  /** Data textures (roughness, bump) must stay linear. */
  linear?: boolean
}

const created: THREE.Texture[] = []

/** Draws to an off-screen canvas and wraps it in a texture. */
export const canvasTexture = (w: number, h: number, draw: Draw, options: Options = {}): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  draw(ctx, w, h)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = options.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace
  texture.anisotropy = 8
  if (options.repeat) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(options.repeat[0], options.repeat[1])
  }
  created.push(texture)
  return texture
}

/** Releases every generated texture (called when the 3D experience unmounts). */
export const disposeCanvasTextures = () => {
  created.forEach((t) => t.dispose())
  created.length = 0
}

/** Shrinks the font until `text` fits in `maxWidth`, then returns the size used. */
export const fitText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  font: (size: number) => string,
): number => {
  let size = startSize
  ctx.font = font(size)
  while (ctx.measureText(text).width > maxWidth && size > 8) {
    size -= 1
    ctx.font = font(size)
  }
  return size
}

export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Light paper speckle used on labels and posters. */
export const speckle = (ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, seed = 7) => {
  const rand = seeded(seed)
  for (let i = 0; i < amount; i++) {
    ctx.fillStyle = `rgba(${rand() > 0.5 ? '70,45,20' : '255,250,235'},${0.03 + rand() * 0.05})`
    ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 2, 1 + rand() * 2)
  }
}

export const FONT = {
  display: (size: number, weight = 600) => `${weight} ${size}px "Fraunces Variable", Georgia, serif`,
  sans: (size: number, weight = 700) => `${weight} ${size}px "Inter Variable", system-ui, sans-serif`,
  mono: (size: number, weight = 500) => `${weight} ${size}px "IBM Plex Mono", ui-monospace, monospace`,
  crt: (size: number) => `400 ${size}px "VT323", ui-monospace, monospace`,
  hand: (size: number, weight = 700) => `${weight} ${size}px "Caveat", cursive`,
}
