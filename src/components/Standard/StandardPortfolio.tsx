import { profile } from '../../data/profile'
import { projects } from '../../data/projects'
import { useStore } from '../../store/useStore'
import { ModeSwitcher } from '../ModeSwitcher/ModeSwitcher'
import { SectionRenderer } from '../PortfolioSections/SectionRenderer'
import { HeroArt } from './HeroArt'
import '../../styles/standard.css'

const NAV = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#education', label: 'Education' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
]

/**
 * Standard mode: a clean, fast, fully accessible page with every piece of portfolio
 * content. It has no dependency on WebGL or on the 3D bundle.
 */
export const StandardPortfolio = () => {
  const notice = useStore((s) => s.notice)
  const webgl = useStore((s) => s.webgl)
  const setMode = useStore((s) => s.setMode)

  return (
    <div className="std theme-paper">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="std-header">
        <a className="std-brand" href="#home" aria-label={`${profile.name}, home`}>
          <span className="std-brand-mark" aria-hidden="true">
            JAV
          </span>
          <span className="std-brand-name">{profile.name}</span>
        </a>
        <nav className="std-nav" aria-label="Sections">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <ModeSwitcher tone="light" />
      </header>

      {notice && (
        <p className="std-notice" role="status">
          {notice}
        </p>
      )}

      <main id="main">
        <section className="std-hero" id="home" aria-labelledby="hero-title">
          <div className="std-hero-text">
            <p className="sec-kicker">{profile.location}</p>
            <h1 id="hero-title">{profile.name}</h1>
            <p className="std-hero-role">{profile.title}</p>
            <p className="std-hero-tagline">{profile.tagline}</p>
            <div className="std-hero-actions">
              <a className="button" href="#projects">
                View projects
              </a>
              <a className="button button-ghost" href="#contact">
                Contact me
              </a>
              {webgl !== false && (
                <button type="button" className="button button-ghost" onClick={() => setMode('immersive')}>
                  Enter the 3D room
                </button>
              )}
            </div>
            <ul className="std-hero-links">
              <li>
                <a className="text-link" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
              </li>
              <li>
                <a className="text-link" href={profile.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <HeroArt />
        </section>

        <section className="std-section" id="about" aria-labelledby="std-about-title">
          <SectionRenderer id="about" scope="std" />
        </section>

        <section className="std-section" id="projects" aria-labelledby="projects-title">
          <header className="sec-head">
            <p className="sec-kicker">Selected work</p>
            <h2 className="sec-title" id="projects-title">
              Projects
            </h2>
          </header>
          <ul className="std-project-index">
            {projects.map((p) => (
              <li key={p.id}>
                <a href={`#${p.id}`}>
                  <span className="std-project-number">{p.number}</span>
                  <span className="std-project-name">{p.shortTitle}</span>
                  <span className="std-project-kind">{p.technologies.join(' · ')}</span>
                </a>
              </li>
            ))}
          </ul>
          {projects.map((p) => (
            <div className="std-project" id={p.id} key={p.id}>
              <SectionRenderer id={p.id} scope="std" />
            </div>
          ))}
        </section>

        <section className="std-section" id="skills" aria-labelledby="std-skills-title">
          <SectionRenderer id="skills" scope="std" />
        </section>
        <section className="std-section" id="experience" aria-labelledby="std-experience-title">
          <SectionRenderer id="experience" scope="std" />
        </section>
        <section className="std-section" id="education" aria-labelledby="std-education-title">
          <SectionRenderer id="education" scope="std" />
        </section>
        <section className="std-section" id="certifications" aria-labelledby="std-certifications-title">
          <SectionRenderer id="certifications" scope="std" />
        </section>
        <section className="std-section" id="contact" aria-labelledby="std-contact-title">
          <SectionRenderer id="contact" scope="std" />
        </section>
      </main>

      <footer className="std-footer">
        <p>
          {profile.name} · {profile.location}
        </p>
        <p>
          <a className="text-link" href="#home">
            Back to top
          </a>
        </p>
      </footer>
    </div>
  )
}
