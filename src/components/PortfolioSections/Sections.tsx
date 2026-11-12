import type { ReactNode } from 'react'
import { profile } from '../../data/profile'
import { skillCategories } from '../../data/skills'
import { experience } from '../../data/experience'
import { education } from '../../data/education'
import { achievements, certifications } from '../../data/certifications'
import { asset } from '../../data/site'
import { ContactForm } from '../Contact/ContactForm'

/**
 * Content sections. The same components are rendered in three places: the standard page,
 * the CRT television and the object panels. Their look is controlled entirely by the
 * theme class on an ancestor (see styles/sections.css).
 */

interface HeadProps {
  kicker: string
  title: string
  id?: string
  children?: ReactNode
}

export const SectionHead = ({ kicker, title, id, children }: HeadProps) => (
  <header className="sec-head">
    <p className="sec-kicker">{kicker}</p>
    <h2 className="sec-title" id={id}>
      {title}
    </h2>
    {children}
  </header>
)

export const Chips = ({ items, label }: { items: string[]; label: string }) => (
  <ul className="chips" aria-label={label}>
    {items.map((item) => (
      <li key={item} className="chip">
        {item}
      </li>
    ))}
  </ul>
)

export const AboutSection = ({ headingId }: { headingId?: string }) => (
  <article className="sec">
    <SectionHead kicker="Introduction" title="About me" id={headingId} />
    <p className="sec-lead">{profile.title}</p>
    {profile.summary.map((p) => (
      <p key={p}>{p}</p>
    ))}
    <h3 className="sec-sub">What I am interested in</h3>
    <Chips items={profile.interests} label="Interests" />
    <dl className="facts">
      <div>
        <dt>Based in</dt>
        <dd>{profile.location}</dd>
      </div>
      <div>
        <dt>Degree</dt>
        <dd>{education[0].degree}</dd>
      </div>
      <div>
        <dt>Graduation</dt>
        <dd>{education[0].graduation}</dd>
      </div>
    </dl>
  </article>
)

export const AchievementsBlock = () => (
  <section className="sec-block" aria-label="Achievements">
    <h3 className="sec-sub">Achievements</h3>
    <ul className="plain-list">
      {achievements.map((a) => (
        <li key={a.title}>
          <strong>{a.title}</strong>
          <span>{a.detail}</span>
        </li>
      ))}
    </ul>
  </section>
)

export const SkillsSection = ({ headingId }: { headingId?: string }) => (
  <article className="sec">
    <SectionHead kicker="Toolbox" title="Technical skills" id={headingId} />
    <div className="skill-grid">
      {skillCategories.map((cat) => (
        <section key={cat.id} className="card skill-card" aria-label={cat.title}>
          <h3 className="card-title">{cat.title}</h3>
          <p className="card-note">{cat.blurb}</p>
          <Chips items={cat.skills} label={cat.title} />
        </section>
      ))}
    </div>
  </article>
)

export const ExperienceSection = ({ headingId }: { headingId?: string }) => (
  <article className="sec">
    <SectionHead kicker="Internship & training" title="Experience" id={headingId} />
    {experience.map((item) => (
      <section key={item.organisation} className="card">
        <div className="card-row">
          <div>
            <h3 className="card-title">{item.organisation}</h3>
            <p className="card-note">
              {item.role} · {item.kind}
            </p>
          </div>
          <p className="badge">{item.period}</p>
        </div>
        <p>{item.summary}</p>
        <h4 className="sec-sub small">Training areas</h4>
        <Chips items={item.areas} label="Training areas" />
      </section>
    ))}
  </article>
)

export const EducationSection = ({ headingId }: { headingId?: string }) => (
  <article className="sec">
    <SectionHead kicker="Academic details" title="Education" id={headingId} />
    {education.map((item) => (
      <section key={item.degree} className="card edu-card">
        <div className="card-row">
          <div>
            <h3 className="card-title">{item.degree}</h3>
            <p className="card-note">
              {item.institution}, {item.location}
            </p>
          </div>
          <p className="badge">{item.period}</p>
        </div>
        <dl className="facts">
          <div>
            <dt>Graduation</dt>
            <dd>{item.graduation}</dd>
          </div>
          <div>
            <dt>CGPA</dt>
            <dd>{item.cgpa}</dd>
          </div>
        </dl>
      </section>
    ))}
  </article>
)

export const CertificationsSection = ({ headingId }: { headingId?: string }) => (
  <article className="sec">
    <SectionHead kicker="Certificates & achievements" title="Certifications" id={headingId} />
    <ul className="cert-grid">
      {certifications.map((cert) => (
        <li key={cert.title} className="card cert-card">
          {cert.image ? (
            <img className="cert-image" src={asset(cert.image)} alt={`Certificate: ${cert.title}`} loading="lazy" />
          ) : (
            <div className="placeholder cert-image" role="img" aria-label="Certificate image not added yet">
              <span>Certificate image</span>
              <small>to be added</small>
            </div>
          )}
          <h3 className="card-title">{cert.title}</h3>
          <p className="card-note">
            {cert.issuer} · {cert.year}
          </p>
          {cert.verifyUrl && (
            <a className="text-link" href={cert.verifyUrl} target="_blank" rel="noreferrer">
              Verify certificate
            </a>
          )}
        </li>
      ))}
    </ul>
    <AchievementsBlock />
  </article>
)

export const ContactLinks = () => (
  <ul className="contact-list">
    <li>
      <span className="contact-key">Email</span>
      <a className="text-link" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
    </li>
    <li>
      <span className="contact-key">GitHub</span>
      <a className="text-link" href={profile.github} target="_blank" rel="noreferrer">
        {profile.github.replace('https://', '')}
      </a>
    </li>
    <li>
      <span className="contact-key">LinkedIn</span>
      {profile.linkedin ? (
        <a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">
          {profile.linkedin.replace('https://', '')}
        </a>
      ) : (
        <span className="pending">Profile link to be added</span>
      )}
    </li>
    <li>
      <span className="contact-key">Location</span>
      <span>{profile.location}</span>
    </li>
  </ul>
)

export const ContactSection = ({ headingId, formId }: { headingId?: string; formId: string }) => (
  <article className="sec">
    <SectionHead kicker="Get in touch" title="Contact" id={headingId} />
    <p>The quickest way to reach me is by email. You can also find my work on GitHub.</p>
    <ContactLinks />
    <h3 className="sec-sub">Send a message</h3>
    <ContactForm idPrefix={formId} />
  </article>
)

export const NoteSection = () => (
  <article className="sec note">
    {profile.note.map((line, i) => (
      <p key={line} className={i === 0 ? 'note-first' : undefined}>
        {line}
      </p>
    ))}
    <p className="note-sign">{profile.shortName}</p>
  </article>
)
