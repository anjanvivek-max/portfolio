import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { profile } from '../../data/profile'
import { objects, sectionMeta, tapes } from '../../data/sections'
import { LOADING_LINE } from '../../data/site'
import { isBusy, isLoaded, loadPercent, useStore, type ViewId } from '../../store/useStore'
import { ModeSwitcher } from '../ModeSwitcher/ModeSwitcher'
import { CrtContent } from '../Crt/CrtContent'
import { ObjectPanel } from './ObjectPanel'
import '../../styles/immersive.css'

/** Downloads the 3D bundle. Safe to call more than once: the module is fetched only once. */
const loadExperience = () =>
  import('../../experience/Experience').then((module) => {
    useStore.getState().markLoaded('bundle')
    return module
  })

const Experience = lazy(loadExperience)

const FALLBACK_NOTICE = 'The 3D room could not start on this device, so the standard version is shown instead.'

/** If anything in the 3D scene throws, visitors still get the full portfolio. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    const s = useStore.getState()
    s.setWebgl(false)
    s.setMode('standard', FALLBACK_NOTICE)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** CRT-styled loading screen driven by the real loading stages. */
const LoadingScreen = () => {
  const load = useStore((s) => s.load)
  const phase = useStore((s) => s.phase)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const [slow, setSlow] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const mounted = useRef(performance.now())
  const percent = loadPercent(load)
  const ready = isLoaded(load)

  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), 15000)
    return () => window.clearTimeout(id)
  }, [])

  // Once everything is really loaded, let the title be read for a moment, then power on.
  useEffect(() => {
    if (!ready || phase !== 'loading') return
    const s = useStore.getState()
    const minimum = s.skipIntro || reducedMotion ? 0 : 1300
    const wait = Math.max(0, minimum - (performance.now() - mounted.current))
    const id = window.setTimeout(() => {
      setLeaving(true)
      useStore.getState().startExperience()
    }, wait)
    return () => window.clearTimeout(id)
  }, [ready, phase, reducedMotion])

  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (phase === 'loading') return
    const id = window.setTimeout(() => setGone(true), 900)
    return () => window.clearTimeout(id)
  }, [phase])
  if (gone) return null

  return (
    <div className={`loader${leaving || phase !== 'loading' ? ' loader-leaving' : ''}`} role="status" aria-live="polite">
      <div className="loader-tube">
        <p className="loader-line">{LOADING_LINE}</p>
        <div className="loader-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="loader-percent">{percent}%</p>
        {slow && !ready && <p className="loader-slow">This is taking longer than usual. The standard version is ready now.</p>}
      </div>
      <div className="loader-actions">
        <button type="button" className="hud-button" onClick={() => useStore.getState().requestSkipIntro()}>
          Skip intro
        </button>
        <button type="button" className="hud-button" onClick={() => useStore.getState().setMode('standard')}>
          Open standard version
        </button>
      </div>
    </div>
  )
}

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'home', label: 'Room' },
  { id: 'desk', label: 'Desk' },
  { id: 'media', label: 'Tapes & TV' },
  { id: 'window', label: 'Window' },
]

/** Tooltip that follows the pointer while a room object is hovered. */
const Tooltip = () => {
  const hovered = useStore((s) => s.hovered)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (ref.current) ref.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return (
    <div ref={ref} className={`tooltip${hovered ? ' tooltip-on' : ''}`} aria-hidden="true">
      {hovered?.label}
    </div>
  )
}

/** Heads-up display: identity, mode switch, sound, viewpoints, index menu and the way back. */
const Hud = () => {
  const phase = useStore((s) => s.phase)
  const view = useStore((s) => s.view)
  const muted = useStore((s) => s.muted)
  const menuOpen = useStore((s) => s.menuOpen)
  const section = useStore((s) => s.activeSection)
  const compact = useStore((s) => s.compact)
  const { toggleMuted, setMenuOpen, setView, back, playTape, openObject } = useStore.getState()

  const indexButton = useRef<HTMLButtonElement>(null)
  const indexMenu = useRef<HTMLElement>(null)
  /** True while the visitor is driving the page from the keyboard. */
  const keyboard = useRef(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      keyboard.current = true
      if (e.key === 'Escape') useStore.getState().back()
    }
    const onPointer = () => {
      keyboard.current = false
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [])

  // Keyboard users: opening the index moves focus into it, and coming back to the room
  // returns focus to the Index button instead of dropping it.
  useEffect(() => {
    if (menuOpen && keyboard.current) indexMenu.current?.querySelector('button')?.focus()
  }, [menuOpen])
  useEffect(() => {
    if (phase !== 'room' || !keyboard.current) return
    const active = document.activeElement
    if (!active || active === document.body) indexButton.current?.focus({ preventScroll: true })
  }, [phase])

  const busy = isBusy(phase)
  const label = section ? sectionMeta(section).screenTitle : ''
  let status = ''
  if (phase === 'tapeSelected') status = `Tape selected: ${label}`
  else if (phase === 'tapeInserting') status = `Loading tape: ${label}`
  else if (phase === 'crtStarting') status = `Starting television: ${label}`
  else if (phase === 'sectionOpen') status = `Now playing: ${label}`
  else if (phase === 'ejecting') status = 'Ejecting tape'

  return (
    <div className="hud">
      <header className="hud-top">
        <div className="hud-brand">
          <p className="hud-name">{profile.name}</p>
          <p className="hud-role">{profile.title}</p>
        </div>
        <div className="hud-tools">
          <button
            ref={indexButton}
            type="button"
            className="hud-button"
            aria-expanded={menuOpen}
            aria-controls="hud-index"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            Index
          </button>
          <button type="button" className="hud-button" aria-pressed={!muted} onClick={toggleMuted}>
            {muted ? 'Sound off' : 'Sound on'}
          </button>
          <ModeSwitcher tone="dark" />
        </div>
      </header>

      {menuOpen && (
        <nav ref={indexMenu} className="hud-index" id="hud-index" aria-label="All sections">
          <p className="hud-index-title">VHS tapes</p>
          <ul>
            {tapes.map((tape, i) => (
              <li key={tape.section}>
                <button type="button" disabled={busy} onClick={() => playTape(tape.section)}>
                  <span style={{ background: tape.color }} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {tape.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="hud-index-title">Objects in the room</p>
          <ul>
            {objects.map((object) => (
              <li key={object.id}>
                <button type="button" disabled={busy} onClick={() => openObject(object.id)}>
                  {object.nav}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <footer className="hud-bottom">
        <p className="hud-status" role="status" aria-live="polite">
          {status}
        </p>
        {phase === 'room' && (
          <>
            <p className="hud-hint">
              {compact ? 'Tap a tape to play it. Drag to look around.' : 'Click a VHS tape to play it. Drag to look around, scroll to zoom.'}
            </p>
            <div className="hud-views" role="group" aria-label="Viewpoints">
              {VIEWS.map((v) => (
                <button key={v.id} type="button" className="hud-chip" aria-pressed={view === v.id} onClick={() => setView(v.id)}>
                  {v.label}
                </button>
              ))}
            </div>
          </>
        )}
        {(phase === 'sectionOpen' || phase === 'objectView') && (
          <button type="button" className="hud-button hud-back" onClick={back}>
            {phase === 'sectionOpen' ? 'Eject tape and return to room' : 'Back to room'} <kbd>Esc</kbd>
          </button>
        )}
      </footer>
    </div>
  )
}

/** On small screens the television picture opens full screen instead of on the 3D glass. */
const CompactCrt = () => {
  const phase = useStore((s) => s.phase)
  const compact = useStore((s) => s.compact)
  const on = phase === 'crtStarting' || phase === 'sectionOpen' || phase === 'ejecting'
  if (!compact || !on) return null
  return (
    <div className="crt-fullscreen">
      <CrtContent />
    </div>
  )
}

/** Everything that belongs to immersive mode: the canvas plus its DOM interface. */
/** Containers that are meant to scroll. Everything else in the room must stay put. */
const SCROLLERS = '.crt-scroll, .panel-body, .hud-index, .field textarea'

export const ImmersiveShell = ({ hidden }: { hidden: boolean }) => {
  const fonts = useStore((s) => s.load.fonts)
  const root = useRef<HTMLDivElement>(null)

  // Start downloading the 3D code straight away, in parallel with the fonts.
  useEffect(() => {
    void loadExperience().catch(() => {
      const s = useStore.getState()
      s.setMode('standard', FALLBACK_NOTICE)
    })
  }, [])

  // Safety net for browsers without `overflow: clip`: if focus or find-in-page scrolls one
  // of the fixed layers (for example the television overlay), put it straight back.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const onScroll = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || target.matches(SCROLLERS)) return
      if (target.scrollTop !== 0) target.scrollTop = 0
      if (target.scrollLeft !== 0) target.scrollLeft = 0
    }
    el.addEventListener('scroll', onScroll, true)
    return () => el.removeEventListener('scroll', onScroll, true)
  }, [])

  return (
    <div ref={root} className="immersive" hidden={hidden} aria-hidden={hidden}>
      <SceneBoundary>
        <Suspense fallback={null}>{fonts && <Experience />}</Suspense>
      </SceneBoundary>
      <div className="grain" aria-hidden="true" />
      <Hud />
      <ObjectPanel />
      <CompactCrt />
      <Tooltip />
      <LoadingScreen />
    </div>
  )
}
