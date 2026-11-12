/**
 * Shared content types. All portfolio text lives in `src/data/*`, so content can be
 * edited without touching the 3D scene or the page layouts.
 */

export type SectionId =
  | 'about'
  | 'project-ai-sql'
  | 'project-bone-marrow'
  | 'experience'
  | 'skills'
  | 'education'
  | 'certifications'
  | 'contact'

/** Panels opened by room objects (rather than by a VHS tape). */
export type ObjectId = 'computer' | 'bookshelf' | 'telephone' | 'photos' | 'notebook'

export interface Profile {
  name: string
  shortName: string
  title: string
  location: string
  email: string
  github: string
  /** Set to your LinkedIn profile URL when you have one. `null` shows a placeholder. */
  linkedin: string | null
  /** Optional resume PDF placed in `public/`, e.g. 'assets/resume.pdf'. */
  resumeUrl: string | null
  tagline: string
  summary: string[]
  interests: string[]
  /** Short first-person note shown in the notebook. */
  note: string[]
}

export interface Screenshot {
  /** Path under `public/`, e.g. 'assets/projects/ai-sql-1.png'. `null` shows a placeholder slot. */
  src: string | null
  caption: string
}

export interface WorkflowStep {
  label: string
  detail: string
}

export type ProjectId = Extract<SectionId, 'project-ai-sql' | 'project-bone-marrow'>

export interface Project {
  id: ProjectId
  number: string
  title: string
  shortTitle: string
  kind: string
  summary: string
  overview: string[]
  problem: string[]
  objective: string[]
  howItWorks: string[]
  technologies: string[]
  features: string[]
  workflowTitle: string
  workflow: WorkflowStep[]
  screenshots: Screenshot[]
  /** Full repository URL. `null` shows "Repository link to be added". */
  repoUrl: string | null
  futureImprovements: string[]
  /** Optional notice shown prominently (used for the medical disclaimer). */
  disclaimer?: string
}

export interface SkillCategory {
  id: string
  title: string
  blurb: string
  skills: string[]
}

export interface ExperienceItem {
  role: string
  organisation: string
  period: string
  kind: string
  summary: string
  areas: string[]
}

export interface EducationItem {
  degree: string
  institution: string
  location: string
  period: string
  graduation: string
  cgpa: string
}

export interface Certification {
  title: string
  issuer: string
  year: string
  /** Path under `public/` to the certificate image. `null` shows a placeholder. */
  image: string | null
  /** Public verification link. `null` hides the link. */
  verifyUrl: string | null
}

export interface Achievement {
  title: string
  detail: string
}

export interface TapeDef {
  section: SectionId
  /** Text printed on the cassette label. */
  label: string
  /** Small catalogue line under the label. */
  sub: string
  /** Label accent colour. */
  color: string
  /** Label paper colour. */
  paper: string
}
