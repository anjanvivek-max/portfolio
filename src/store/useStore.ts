import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { ObjectId, SectionId } from '../data/types'
import { STORAGE_KEYS } from '../data/site'
import { sound } from '../audio/sound'

export type Mode = 'immersive' | 'standard'

/**
 * The application state machine.
 *
 *   loading -> intro -> room
 *   room -> tapeSelected -> tapeInserting -> crtStarting -> sectionOpen -> ejecting -> room
 *   room -> objectView -> room
 *
 * Only the transitions listed in NEXT are legal. Anything else is ignored, which is what
 * prevents two tapes being inserted at once or a transition being interrupted halfway.
 */
export type Phase =
  | 'loading'
  | 'intro'
  | 'room'
  | 'tapeSelected'
  | 'tapeInserting'
  | 'crtStarting'
  | 'sectionOpen'
  | 'ejecting'
  | 'objectView'

const NEXT: Record<Phase, Phase[]> = {
  loading: ['intro', 'room'],
  intro: ['room'],
  room: ['tapeSelected', 'objectView'],
  tapeSelected: ['tapeInserting'],
  tapeInserting: ['crtStarting'],
  crtStarting: ['sectionOpen'],
  sectionOpen: ['ejecting'],
  ejecting: ['room'],
  objectView: ['room'],
}

/** Camera viewpoints. Object ids double as close-up views. */
export type ViewId = 'home' | 'desk' | 'media' | 'tv' | 'window' | ObjectId

/** Base durations of each timed phase, in milliseconds. */
export const DURATION = {
  tapeSelected: 850,
  tapeInserting: 1500,
  crtStarting: 1700,
  ejecting: 1500,
  intro: 3600,
} as const

type Queued = { kind: 'tape'; id: SectionId } | { kind: 'object'; id: ObjectId } | null

export interface LoadStages {
  fonts: boolean
  bundle: boolean
  scene: boolean
  frame: boolean
}

const LOAD_WEIGHTS: Record<keyof LoadStages, number> = { fonts: 15, bundle: 35, scene: 30, frame: 20 }

interface State {
  mode: Mode
  /** null until checked. */
  webgl: boolean | null
  /** Shown in standard mode when 3D could not start. */
  notice: string | null
  phase: Phase
  phaseStartedAt: number
  phaseDuration: number
  activeSection: SectionId | null
  activeObject: ObjectId | null
  queued: Queued
  view: ViewId
  /** Bumped whenever a view is requested, so re-selecting the current view re-centres it. */
  viewTick: number
  hovered: { id: string; label: string } | null
  muted: boolean
  reducedMotion: boolean
  compact: boolean
  load: LoadStages
  skipIntro: boolean
  menuOpen: boolean

  setMode: (mode: Mode, notice?: string | null) => void
  setWebgl: (ok: boolean) => void
  setReducedMotion: (v: boolean) => void
  setCompact: (v: boolean) => void
  markLoaded: (stage: keyof LoadStages) => void
  requestSkipIntro: (remember?: boolean) => void
  startExperience: () => void
  setHovered: (h: { id: string; label: string } | null) => void
  setView: (v: ViewId) => void
  setMenuOpen: (v: boolean) => void
  toggleMuted: () => void
  playTape: (id: SectionId) => void
  eject: () => void
  openObject: (id: ObjectId) => void
  closeObject: () => void
  /** Universal "go back": eject the tape, close a panel, or return to the home view. */
  back: () => void
}

const timers = new Set<number>()
const after = (ms: number, fn: () => void) => {
  const id = window.setTimeout(() => {
    timers.delete(id)
    fn()
  }, ms)
  timers.add(id)
}
const clearTimers = () => {
  timers.forEach((id) => window.clearTimeout(id))
  timers.clear()
}

const readStored = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}
const writeStored = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* storage unavailable (private mode): preference simply is not remembered */
  }
}

const initialMode = (): Mode => {
  const param = new URLSearchParams(window.location.search).get('mode')
  if (param === 'standard' || param === 'immersive') return param
  const stored = readStored(STORAGE_KEYS.mode)
  if (stored === 'standard' || stored === 'immersive') return stored
  return 'immersive'
}

export const useStore = create<State>()(
  subscribeWithSelector((set, get) => {
    /** Moves to `phase` if the transition is legal. Returns whether it happened. */
    const go = (phase: Phase, patch: Partial<State> = {}, duration = 0): boolean => {
      const current = get().phase
      if (!NEXT[current].includes(phase)) return false
      set({ phase, phaseStartedAt: performance.now(), phaseDuration: duration, ...patch })
      return true
    }

    /** Scales timed phases down for people who prefer reduced motion. */
    const dur = (key: keyof typeof DURATION): number =>
      get().reducedMotion ? Math.min(DURATION[key], 260) : DURATION[key]

    const runQueued = () => {
      const q = get().queued
      if (!q) return
      set({ queued: null })
      if (q.kind === 'tape') get().playTape(q.id)
      else get().openObject(q.id)
    }

    return {
      mode: initialMode(),
      webgl: null,
      notice: null,
      phase: 'loading',
      phaseStartedAt: 0,
      phaseDuration: 0,
      activeSection: null,
      activeObject: null,
      queued: null,
      view: 'home',
      viewTick: 0,
      hovered: null,
      muted: true,
      reducedMotion: false,
      compact: false,
      load: { fonts: false, bundle: false, scene: false, frame: false },
      skipIntro: readStored(STORAGE_KEYS.skipIntro) === '1',
      menuOpen: false,

      setMode: (mode, notice = null) => {
        const s = get()
        if (mode === 'standard') {
          // Leaving the room: settle the state machine so nothing is left half-played.
          clearTimers()
          const loaded = s.phase !== 'loading'
          set({
            mode,
            notice,
            hovered: null,
            menuOpen: false,
            queued: null,
            activeSection: null,
            activeObject: null,
            view: 'home',
            phase: loaded ? 'room' : 'loading',
            phaseStartedAt: performance.now(),
            phaseDuration: 0,
          })
          sound.ambient(false)
        } else {
          set({ mode, notice: null })
          if (!get().muted) sound.ambient(true)
        }
        // Remember the visitor's own choice, but not an automatic fallback.
        if (!notice) writeStored(STORAGE_KEYS.mode, mode)
        const url = new URL(window.location.href)
        if (url.searchParams.has('mode')) {
          url.searchParams.set('mode', mode)
          window.history.replaceState(null, '', url)
        }
      },

      setWebgl: (ok) => set({ webgl: ok }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setCompact: (v) => set({ compact: v }),

      markLoaded: (stage) => {
        if (get().load[stage]) return
        set({ load: { ...get().load, [stage]: true } })
      },

      requestSkipIntro: (remember = true) => {
        set({ skipIntro: true })
        if (remember) writeStored(STORAGE_KEYS.skipIntro, '1')
        // If the reveal is already playing, cut straight to the room.
        if (get().phase === 'intro') {
          clearTimers()
          go('room', { view: 'home' })
        }
      },

      startExperience: () => {
        const s = get()
        if (s.phase !== 'loading') return
        if (s.skipIntro || s.reducedMotion) {
          go('room', { view: 'home' })
          return
        }
        const d = DURATION.intro
        if (go('intro', { view: 'home' }, d)) {
          after(d, () => {
            go('room')
            // First visit completed: next time the reveal is skipped automatically.
            writeStored(STORAGE_KEYS.skipIntro, '1')
          })
        }
      },

      setHovered: (h) => {
        const cur = get().hovered
        if (cur?.id === h?.id) return
        set({ hovered: h })
      },

      setView: (v) => {
        if (get().phase !== 'room') return
        set({ view: v, viewTick: get().viewTick + 1 })
      },

      setMenuOpen: (v) => set({ menuOpen: v }),

      toggleMuted: () => {
        const muted = !get().muted
        set({ muted })
        sound.setMuted(muted)
        if (!muted) {
          sound.play('click')
          if (get().mode === 'immersive') sound.ambient(true)
        }
      },

      playTape: (id) => {
        const s = get()
        if (s.phase === 'sectionOpen') {
          if (s.activeSection === id) return
          set({ queued: { kind: 'tape', id } })
          get().eject()
          return
        }
        if (s.phase === 'objectView') {
          set({ queued: { kind: 'tape', id } })
          get().closeObject()
          return
        }
        if (s.phase !== 'room') return

        const dSelect = dur('tapeSelected')
        const dInsert = dur('tapeInserting')
        const dCrt = dur('crtStarting')
        if (!go('tapeSelected', { activeSection: id, view: 'media', hovered: null, menuOpen: false }, dSelect)) return
        sound.play('pickup')
        after(dSelect, () => {
          if (!go('tapeInserting', {}, dInsert)) return
          sound.play('insert')
          after(dInsert, () => {
            if (!go('crtStarting', { view: 'tv' }, dCrt)) return
            sound.play('crtOn')
            after(dCrt, () => {
              go('sectionOpen')
            })
          })
        })
      },

      eject: () => {
        const d = dur('ejecting')
        if (!go('ejecting', { view: 'media', hovered: null }, d)) return
        sound.play('eject')
        after(d, () => {
          const hasQueue = get().queued !== null
          if (go('room', { activeSection: null, view: hasQueue ? 'media' : 'home' })) runQueued()
        })
      },

      openObject: (id) => {
        const s = get()
        if (s.phase === 'sectionOpen') {
          set({ queued: { kind: 'object', id } })
          get().eject()
          return
        }
        if (s.phase === 'objectView') {
          if (s.activeObject === id) return
          // Swap panels directly: close, then open the new one.
          set({ phase: 'room', activeObject: null })
        } else if (s.phase !== 'room') {
          return
        }
        if (go('objectView', { activeObject: id, view: id, hovered: null, menuOpen: false })) {
          sound.play('click')
        }
      },

      closeObject: () => {
        if (go('room', { activeObject: null, view: 'home' })) {
          sound.play('click')
          runQueued()
        }
      },

      back: () => {
        const s = get()
        if (s.menuOpen) {
          set({ menuOpen: false })
          return
        }
        if (s.phase === 'sectionOpen') get().eject()
        else if (s.phase === 'objectView') get().closeObject()
        else if (s.phase === 'room') set({ view: 'home', viewTick: s.viewTick + 1 })
      },
    }
  }),
)

/** Loading progress from 0 to 100, derived from the stages that have really completed. */
export const loadPercent = (load: LoadStages): number =>
  (Object.keys(LOAD_WEIGHTS) as (keyof LoadStages)[]).reduce(
    (sum, key) => sum + (load[key] ? LOAD_WEIGHTS[key] : 0),
    0,
  )

export const isLoaded = (load: LoadStages): boolean => loadPercent(load) >= 100

/** True while a timed transition is running and input should be ignored. */
export const isBusy = (phase: Phase): boolean =>
  phase === 'loading' ||
  phase === 'intro' ||
  phase === 'tapeSelected' ||
  phase === 'tapeInserting' ||
  phase === 'crtStarting' ||
  phase === 'ejecting'

/** Progress (0..1) through the current timed phase. */
export const phaseProgress = (now = performance.now()): number => {
  const { phaseStartedAt, phaseDuration } = useStore.getState()
  if (phaseDuration <= 0) return 1
  return Math.min(1, Math.max(0, (now - phaseStartedAt) / phaseDuration))
}
