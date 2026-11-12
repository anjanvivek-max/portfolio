import type { ObjectId, SectionId, TapeDef } from './types'

export interface SectionMeta {
  id: SectionId
  /** Navigation label. */
  nav: string
  /** Title shown on the television when the tape starts. */
  screenTitle: string
  /** Anchor id used in standard mode. */
  anchor: string
}

export const sections: SectionMeta[] = [
  { id: 'about', nav: 'About', screenTitle: 'ABOUT ME', anchor: 'about' },
  { id: 'project-ai-sql', nav: 'Project 01', screenTitle: 'PROJECTS 01', anchor: 'project-ai-sql' },
  { id: 'project-bone-marrow', nav: 'Project 02', screenTitle: 'PROJECTS 02', anchor: 'project-bone-marrow' },
  { id: 'experience', nav: 'Experience', screenTitle: 'EXPERIENCE', anchor: 'experience' },
  { id: 'skills', nav: 'Skills', screenTitle: 'SKILLS', anchor: 'skills' },
  { id: 'education', nav: 'Education', screenTitle: 'EDUCATION', anchor: 'education' },
  { id: 'certifications', nav: 'Certifications', screenTitle: 'CERTIFICATIONS', anchor: 'certifications' },
  { id: 'contact', nav: 'Contact', screenTitle: 'CONTACT', anchor: 'contact' },
]

export const sectionMeta = (id: SectionId): SectionMeta => sections.find((s) => s.id === id) as SectionMeta

/**
 * The eight VHS tapes. Order here is the order on the rack (top row first, left to right).
 * Colours are muted, period-appropriate label inks.
 */
export const tapes: TapeDef[] = [
  { section: 'about', label: 'ABOUT ME', sub: 'TAPE 01 · INTRODUCTION', color: '#b5532a', paper: '#f3e7cd' },
  { section: 'project-ai-sql', label: 'PROJECTS 01', sub: 'TAPE 02 · AI SQL ASSISTANT', color: '#2f5d62', paper: '#efe6d2' },
  { section: 'project-bone-marrow', label: 'PROJECTS 02', sub: 'TAPE 03 · GRAFT REJECTION', color: '#6b7a3a', paper: '#f1e9d0' },
  { section: 'experience', label: 'EXPERIENCE', sub: 'TAPE 04 · INFOSYS SPRINGBOARD', color: '#8a5a2b', paper: '#f4e8cf' },
  { section: 'skills', label: 'SKILLS', sub: 'TAPE 05 · TOOLBOX', color: '#c08a2e', paper: '#f2e8d1' },
  { section: 'education', label: 'EDUCATION', sub: 'TAPE 06 · B.TECH IT', color: '#3f5a85', paper: '#efe7d4' },
  { section: 'certifications', label: 'CERTIFICATIONS', sub: 'TAPE 07 · CERTIFICATES', color: '#7d3b4a', paper: '#f3e8d3' },
  { section: 'contact', label: 'CONTACT', sub: 'TAPE 08 · GET IN TOUCH', color: '#3c6e4f', paper: '#f1e8d0' },
]

export const tapeFor = (id: SectionId): TapeDef => tapes.find((t) => t.section === id) as TapeDef

export interface ObjectMeta {
  id: ObjectId
  /** Tooltip shown when the object is hovered. */
  tooltip: string
  /** Title of the panel it opens. */
  title: string
  /** Label used in the keyboard and touch menu. */
  nav: string
}

/** Room objects that open content directly, without a tape. */
export const objects: ObjectMeta[] = [
  { id: 'computer', tooltip: 'Computer · Technical skills', title: 'Technical skills', nav: 'Computer: skills' },
  { id: 'bookshelf', tooltip: 'Bookshelf · Education & certifications', title: 'Education & certifications', nav: 'Bookshelf: education' },
  { id: 'telephone', tooltip: 'Telephone · Contact', title: 'Contact', nav: 'Telephone: contact' },
  { id: 'photos', tooltip: 'Photographs · About & achievements', title: 'About & achievements', nav: 'Photos: about' },
  { id: 'notebook', tooltip: 'Notebook · A short note', title: 'A short note', nav: 'Notebook: note' },
]

export const objectMeta = (id: ObjectId): ObjectMeta => objects.find((o) => o.id === id) as ObjectMeta
