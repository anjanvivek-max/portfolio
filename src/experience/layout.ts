/**
 * World layout, in metres. The room sits around the origin with the floor at y = 0 and
 * the panoramic window in the back wall (negative z). Keeping every position here makes
 * the furniture, the camera viewpoints and the tape animation agree with each other.
 */

export const ROOM = { halfW: 3.5, halfD: 2.6, h: 3.0 }
export const BACK_Z = -ROOM.halfD

/** Window opening in the back wall. */
export const WIN = { x0: -2.2, x1: 3.3, y0: 0.9, y1: 2.72 }

export const DESK = { x: -1.1, z: -2.12, w: 2.3, d: 0.8, top: 0.76 }
export const CRED = { x: 1.7, z: -2.27, w: 2.6, d: 0.56, top: 0.62 }

export const VCR = { x: 1.25, y: CRED.top, z: -2.24, w: 0.58, h: 0.11, d: 0.4 }
export const VCR_FRONT_Z = VCR.z + VCR.d / 2
/** Centre of the cassette slot on the VCR front. */
export const VCR_SLOT = { x: VCR.x - 0.1, y: VCR.y + 0.066, z: VCR_FRONT_Z }

export const TV = { x: 1.25, y: VCR.y + VCR.h, z: -2.27, w: 0.76, h: 0.6, d: 0.5 }
export const TV_FRONT_Z = TV.z + TV.d / 2
export const TV_SCREEN = { x: TV.x - 0.085, y: TV.y + 0.305, z: TV_FRONT_Z + 0.004, w: 0.5, h: 0.375 }

/** VHS cassette size (slightly larger than life so labels stay readable). */
export const TAPE = { w: 0.245, h: 0.135, d: 0.033 }
export const RACK = { x: 2.4, z: -2.24 }
export const TAPE_LEAN = -0.17

/** Resting position of tape `i` (0-7) on the two-tier rack. */
export const tapeRest = (i: number): [number, number, number] => {
  const backRow = i < 4
  const col = i % 4
  const x = RACK.x + (col - 1.5) * (TAPE.w + 0.02)
  const y = CRED.top + (backRow ? 0.172 : 0.014) + TAPE.h / 2
  const z = backRow ? RACK.z - 0.1 : RACK.z + 0.07
  return [x, y, z]
}

export const COMPUTER = { x: -1.5, z: -2.22 }
export const MONITOR_SCREEN = { x: COMPUTER.x, y: DESK.top + 0.3, z: COMPUTER.z + 0.196, w: 0.268, h: 0.201 }

export const PHONE = { x: 0.68, z: -2.2 }
export const NOTEBOOK = { x: -0.78, z: -1.9 }
export const TYPEWRITER = { x: -0.33, z: -2.2 }
export const BOOKSHELF = { x: -2.9, z: -2.44, w: 1.0, d: 0.32, h: 2.05 }
export const PHOTO_WALL = { x: ROOM.halfW, y: 1.62, z: -1.5 }

/* ---------- city ---------- */

/** Street level outside. The room is roughly five floors up. */
export const GROUND_Y = -14
export const VIADUCT = { z: -95, deckTop: -5.5, halfLength: 380 }
