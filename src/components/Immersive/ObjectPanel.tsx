import { useEffect, useRef } from 'react'
import { objectMeta } from '../../data/sections'
import type { ObjectId } from '../../data/types'
import { useStore } from '../../store/useStore'
import {
  AboutSection,
  AchievementsBlock,
  CertificationsSection,
  ContactSection,
  EducationSection,
  NoteSection,
  SkillsSection,
} from '../PortfolioSections/Sections'

const content = (id: ObjectId) => {
  switch (id) {
    case 'computer':
      return <SkillsSection headingId="panel-title" />
    case 'bookshelf':
      return (
        <>
          <EducationSection headingId="panel-title" />
          <CertificationsSection />
        </>
      )
    case 'telephone':
      return <ContactSection headingId="panel-title" formId="panel-contact" />
    case 'photos':
      return (
        <>
          <AboutSection headingId="panel-title" />
          <AchievementsBlock />
        </>
      )
    case 'notebook':
      return <NoteSection />
  }
}

const theme = (id: ObjectId): string =>
  id === 'computer' ? 'theme-terminal panel-terminal' : id === 'notebook' ? 'theme-paper panel-note' : 'theme-paper'

/**
 * Side panel opened by a room object (computer, bookshelf, telephone, photographs,
 * notebook). The camera glides to the object while this slides in beside it.
 */
export const ObjectPanel = () => {
  const phase = useStore((s) => s.phase)
  const id = useStore((s) => s.activeObject)
  const close = useStore((s) => s.closeObject)
  const panel = useRef<HTMLElement>(null)
  const open = phase === 'objectView' && id !== null

  useEffect(() => {
    if (open) panel.current?.focus({ preventScroll: true })
  }, [open, id])

  if (!open || !id) return null
  const meta = objectMeta(id)

  return (
    <aside
      ref={panel}
      className={`panel ${theme(id)}`}
      role="dialog"
      aria-label={meta.title}
      tabIndex={-1}
      onWheel={(e) => e.stopPropagation()}
    >
      <header className="panel-head">
        <p className="panel-kicker">{meta.tooltip}</p>
        <button type="button" className="panel-close" onClick={close} aria-label="Close and go back to the room">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>
      <div className="panel-body">{content(id)}</div>
    </aside>
  )
}
