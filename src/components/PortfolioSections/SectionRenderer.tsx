import type { SectionId } from '../../data/types'
import { getProject } from '../../data/projects'
import {
  AboutSection,
  CertificationsSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  SkillsSection,
} from './Sections'
import { ProjectCaseStudy } from './ProjectCaseStudy'

interface Props {
  id: SectionId
  /** Prefix that keeps heading and form ids unique when a section is rendered twice. */
  scope: string
}

/** Renders the content for a section id. Used by the television and the standard page. */
export const SectionRenderer = ({ id, scope }: Props) => {
  const headingId = `${scope}-${id}-title`
  switch (id) {
    case 'about':
      return <AboutSection headingId={headingId} />
    case 'project-ai-sql':
    case 'project-bone-marrow':
      return <ProjectCaseStudy project={getProject(id)} headingId={headingId} />
    case 'experience':
      return <ExperienceSection headingId={headingId} />
    case 'skills':
      return <SkillsSection headingId={headingId} />
    case 'education':
      return <EducationSection headingId={headingId} />
    case 'certifications':
      return <CertificationsSection headingId={headingId} />
    case 'contact':
      return <ContactSection headingId={headingId} formId={`${scope}-contact`} />
  }
}
