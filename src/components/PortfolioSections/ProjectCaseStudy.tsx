import { Fragment } from 'react'
import type { Project } from '../../data/types'
import { asset } from '../../data/site'
import { Chips, SectionHead } from './Sections'

const Paragraphs = ({ items }: { items: string[] }) => (
  <>
    {items.map((p) => (
      <p key={p}>{p}</p>
    ))}
  </>
)

/** Data-driven flow diagram: boxes joined by arrows, horizontal when there is room. */
export const WorkflowDiagram = ({ project }: { project: Project }) => (
  <figure className="flow" aria-label={project.workflowTitle}>
    <ol className="flow-steps">
      {project.workflow.map((step, i) => (
        <Fragment key={step.label}>
          <li className="flow-step">
            <span className="flow-index" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <strong>{step.label}</strong>
            <span>{step.detail}</span>
          </li>
          {i < project.workflow.length - 1 && (
            <li className="flow-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M4 12h14m-5-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </li>
          )}
        </Fragment>
      ))}
    </ol>
    <figcaption>{project.workflowTitle}</figcaption>
  </figure>
)

export const ProjectCaseStudy = ({ project, headingId }: { project: Project; headingId?: string }) => (
  <article className="sec project">
    <SectionHead kicker={`Project ${project.number} · ${project.kind}`} title={project.title} id={headingId} />
    <p className="sec-lead">{project.summary}</p>

    {project.disclaimer && (
      <p className="notice" role="note">
        <strong>Important.</strong> {project.disclaimer}
      </p>
    )}

    <h3 className="sec-sub">Technologies</h3>
    <Chips items={project.technologies} label="Technologies used" />

    <div className="project-cols">
      <section>
        <h3 className="sec-sub">Overview</h3>
        <Paragraphs items={project.overview} />
      </section>
      <section>
        <h3 className="sec-sub">Problem</h3>
        <Paragraphs items={project.problem} />
      </section>
      <section>
        <h3 className="sec-sub">Objective</h3>
        <ul className="tick-list">
          {project.objective.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="sec-sub">Main features</h3>
        <ul className="tick-list">
          {project.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>
    </div>

    <h3 className="sec-sub">How it works</h3>
    <ol className="step-list">
      {project.howItWorks.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ol>

    <h3 className="sec-sub">{project.workflowTitle}</h3>
    <WorkflowDiagram project={project} />

    <h3 className="sec-sub">Screenshots</h3>
    <ul className="shot-grid">
      {project.screenshots.map((shot) => (
        <li key={shot.caption}>
          <figure className="shot">
            {shot.src ? (
              <img src={asset(shot.src)} alt={shot.caption} loading="lazy" />
            ) : (
              <div className="placeholder" role="img" aria-label={`Screenshot not added yet: ${shot.caption}`}>
                <span>Screenshot</span>
                <small>to be added</small>
              </div>
            )}
            <figcaption>{shot.caption}</figcaption>
          </figure>
        </li>
      ))}
    </ul>

    <h3 className="sec-sub">Source code</h3>
    {project.repoUrl ? (
      <a className="button-link" href={project.repoUrl} target="_blank" rel="noreferrer">
        View repository on GitHub
      </a>
    ) : (
      <p className="pending">Repository link to be added.</p>
    )}

    <h3 className="sec-sub">
      Potential improvements <span className="tag">proposed, not implemented</span>
    </h3>
    <ul className="plain-bullets">
      {project.futureImprovements.map((f) => (
        <li key={f}>{f}</li>
      ))}
    </ul>
  </article>
)
