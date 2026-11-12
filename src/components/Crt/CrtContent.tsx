import { useEffect, useRef, useState } from 'react'
import { sectionMeta, tapes } from '../../data/sections'
import { useStore } from '../../store/useStore'
import { SectionRenderer } from '../PortfolioSections/SectionRenderer'
import '../../styles/crt.css'

const formatCounter = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * The television picture: startup sequence, on-screen display, the selected portfolio
 * section and the eject controls. It is plain DOM, so it works both placed on the 3D
 * television and as a full-screen panel on small devices.
 */
export const CrtContent = () => {
  const phase = useStore((s) => s.phase)
  const section = useStore((s) => s.activeSection)
  const eject = useStore((s) => s.eject)
  const playTape = useStore((s) => s.playTape)
  const [seconds, setSeconds] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)

  const open = phase === 'sectionOpen'

  // Tape counter runs while the tape plays.
  useEffect(() => {
    if (!open) {
      setSeconds(0)
      return
    }
    const id = window.setInterval(() => setSeconds((v) => v + 1), 1000)
    return () => window.clearInterval(id)
  }, [open, section])

  // Move keyboard focus into the picture when the section appears.
  useEffect(() => {
    if (open) scroller.current?.focus({ preventScroll: true })
  }, [open, section])

  if (!section) return null
  const meta = sectionMeta(section)
  const index = tapes.findIndex((t) => t.section === section)
  const previous = tapes[(index + tapes.length - 1) % tapes.length]
  const next = tapes[(index + 1) % tapes.length]

  return (
    <div className="crt theme-crt" data-phase={phase}>
      <div className="crt-picture">
        {/* startup: line, bloom, static, title card */}
        <div className="crt-startup" aria-hidden="true">
          <div className="crt-line" />
          <div className="crt-static" />
          <div className="crt-card">
            <p className="crt-card-play">PLAY &#9654;</p>
            <p className="crt-card-title">{meta.screenTitle}</p>
            <p className="crt-card-sub">TAPE {String(index + 1).padStart(2, '0')} OF 08</p>
          </div>
        </div>

        <div className="crt-osd" aria-hidden="true">
          <span>PLAY &#9654; {meta.screenTitle}</span>
          <span>SP {formatCounter(seconds)}</span>
        </div>

        <div
          className="crt-scroll"
          ref={scroller}
          tabIndex={0}
          role="region"
          aria-label={`${meta.nav} section`}
          onWheel={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {open && <SectionRenderer id={section} scope="crt" />}
        </div>

        <div className="crt-bar">
          <button
            type="button"
            className="crt-button"
            onClick={() => playTape(previous.section)}
            disabled={!open}
            aria-label={`Previous tape: ${previous.label}`}
          >
            &#9664; <span className="crt-button-label">{previous.label}</span>
          </button>
          <button type="button" className="crt-button crt-eject" onClick={eject} disabled={!open}>
            &#9167; Eject tape
          </button>
          <button
            type="button"
            className="crt-button"
            onClick={() => playTape(next.section)}
            disabled={!open}
            aria-label={`Next tape: ${next.label}`}
          >
            <span className="crt-button-label">{next.label}</span> &#9654;
          </button>
        </div>
      </div>
      {/* glass effects sit above the picture and never take clicks */}
      <div className="crt-fx" aria-hidden="true" />
    </div>
  )
}
