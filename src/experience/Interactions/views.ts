import type { ViewId } from '../../store/useStore'
import { MONITOR_SCREEN, NOTEBOOK, PHONE, PHOTO_WALL, TV_SCREEN, BOOKSHELF, DESK } from '../layout'

type Vec3 = [number, number, number]

export interface ViewPose {
  position: Vec3
  target: Vec3
  /** How far the visitor may orbit from this pose, in radians. */
  azimuth: number
  polarUp: number
  polarDown: number
  /** Dolly range as fractions of the pose distance. */
  zoomIn: number
  zoomOut: number
  /** True when a side panel opens with this view, so the subject is shifted off-centre. */
  panel?: boolean
}

interface Env {
  aspect: number
  fovDeg: number
  compact: boolean
}

/** Distance at which a w x h rectangle fills the given fractions of the viewport. */
const fitDistance = (w: number, h: number, env: Env, fillW: number, fillH: number): number => {
  const t = Math.tan((env.fovDeg * Math.PI) / 360)
  const byHeight = h / fillH / (2 * t)
  const byWidth = w / fillW / (2 * t * env.aspect)
  return Math.max(byHeight, byWidth)
}

/** Start of the opening reveal: close to the television, looking out of the window. */
export const INTRO_START: { position: Vec3; target: Vec3 } = {
  position: [0.75, 1.32, -0.95],
  target: [0.95, 1.22, -2.6],
}

export const resolveView = (id: ViewId, env: Env): ViewPose => {
  const narrow = env.aspect < 1
  switch (id) {
    case 'home':
      return narrow
        ? {
            position: [1.35, 1.5, 2.35],
            target: [1.5, 1.12, -2.3],
            azimuth: 0.75,
            polarUp: 0.2,
            polarDown: 0.1,
            zoomIn: 0.5,
            zoomOut: 1,
          }
        : {
            position: [0.15, 1.62, 2.28],
            target: [0.2, 1.15, -2.3],
            azimuth: 0.62,
            polarUp: 0.24,
            polarDown: 0.1,
            zoomIn: 0.36,
            zoomOut: 1,
          }
    case 'desk':
      return {
        position: [-1.05, 1.42, -0.2],
        target: [-1.1, 0.98, -2.2],
        azimuth: 0.6,
        polarUp: 0.35,
        polarDown: 0.12,
        zoomIn: 0.6,
        zoomOut: 1.15,
      }
    case 'media':
      return {
        position: narrow ? [1.85, 1.3, 0.55] : [1.85, 1.24, -0.42],
        target: [1.85, 0.98, -2.3],
        azimuth: 0.5,
        polarUp: 0.3,
        polarDown: 0.1,
        zoomIn: 0.6,
        zoomOut: 1.2,
      }
    case 'tv': {
      // Head-on, at the distance where the 4:3 screen sits comfortably inside the viewport.
      const d = fitDistance(TV_SCREEN.w, TV_SCREEN.h, env, 0.9, 0.74)
      return {
        position: [TV_SCREEN.x, TV_SCREEN.y + 0.004, TV_SCREEN.z + d],
        target: [TV_SCREEN.x, TV_SCREEN.y + 0.004, TV_SCREEN.z],
        azimuth: 0,
        polarUp: 0,
        polarDown: 0,
        zoomIn: 1,
        zoomOut: 1,
      }
    }
    case 'window':
      return {
        position: [0.22, 1.86, -1.25],
        target: [0.3, 1.5, -2.6],
        azimuth: 0.85,
        polarUp: 0.12,
        polarDown: 0.3,
        zoomIn: 0.75,
        zoomOut: 1.3,
      }
    case 'computer':
      return {
        position: [MONITOR_SCREEN.x + 0.12, 1.2, -1.22],
        target: [MONITOR_SCREEN.x, 1.0, MONITOR_SCREEN.z],
        azimuth: 0.25,
        polarUp: 0.15,
        polarDown: 0.1,
        zoomIn: 1,
        zoomOut: 1,
        panel: true,
      }
    case 'bookshelf':
      return {
        position: [-2.45, 1.3, -0.55],
        target: [BOOKSHELF.x, 1.12, BOOKSHELF.z],
        azimuth: 0.25,
        polarUp: 0.15,
        polarDown: 0.1,
        zoomIn: 1,
        zoomOut: 1,
        panel: true,
      }
    case 'telephone':
      return {
        position: [PHONE.x + 0.1, 1.08, -1.32],
        target: [PHONE.x, 0.7, PHONE.z],
        azimuth: 0.25,
        polarUp: 0.15,
        polarDown: 0.1,
        zoomIn: 1,
        zoomOut: 1,
        panel: true,
      }
    case 'photos':
      return {
        position: [1.75, 1.6, -1.42],
        target: [PHOTO_WALL.x, PHOTO_WALL.y, PHOTO_WALL.z],
        azimuth: 0.25,
        polarUp: 0.15,
        polarDown: 0.1,
        zoomIn: 1,
        zoomOut: 1,
        panel: true,
      }
    case 'notebook':
      return {
        position: [NOTEBOOK.x + 0.02, DESK.top + 0.62, NOTEBOOK.z + 0.42],
        target: [NOTEBOOK.x, DESK.top, NOTEBOOK.z],
        azimuth: 0.25,
        polarUp: 0.15,
        polarDown: 0.1,
        zoomIn: 1,
        zoomOut: 1,
        panel: true,
      }
  }
}
