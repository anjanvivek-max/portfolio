import { useState, type FormEvent } from 'react'
import { profile } from '../../data/profile'
import { CONTACT_ENDPOINT } from '../../data/site'

interface Fields {
  name: string
  email: string
  subject: string
  message: string
}

type Errors = Partial<Record<keyof Fields, string>>

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'mail-opened' }
  | { kind: 'error'; text: string }

const EMPTY: Fields = { name: '', email: '', subject: '', message: '' }

const validate = (f: Fields): Errors => {
  const errors: Errors = {}
  if (!f.name.trim()) errors.name = 'Please enter your name.'
  if (!f.email.trim()) errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) errors.email = 'That email address does not look right.'
  if (!f.subject.trim()) errors.subject = 'Please add a subject.'
  if (!f.message.trim()) errors.message = 'Please write a message.'
  else if (f.message.trim().length < 10) errors.message = 'Please write at least 10 characters.'
  return errors
}

const buildMailto = (f: Fields): string => {
  const body = `${f.message.trim()}\n\nFrom: ${f.name.trim()} <${f.email.trim()}>`
  return `mailto:${profile.email}?subject=${encodeURIComponent(f.subject.trim())}&body=${encodeURIComponent(body)}`
}

/**
 * Contact form.
 *
 * With no backend configured (CONTACT_ENDPOINT === null) it never claims to have sent
 * anything: it opens the visitor's own email app with the message filled in and says so.
 * When CONTACT_ENDPOINT is set it POSTs JSON and reports the real outcome.
 */
export const ContactForm = ({ idPrefix }: { idPrefix: string }) => {
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [copied, setCopied] = useState(false)

  const update = (key: keyof Fields, value: string) => {
    const next = { ...fields, [key]: value }
    setFields(next)
    if (touched[key]) setErrors(validate(next))
    if (status.kind !== 'idle' && status.kind !== 'sending') setStatus({ kind: 'idle' })
  }

  const blur = (key: keyof Fields) => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors(validate(fields))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found = validate(fields)
    setErrors(found)
    setTouched({ name: true, email: true, subject: true, message: true })
    const firstInvalid = (Object.keys(found) as (keyof Fields)[])[0]
    if (firstInvalid) {
      document.getElementById(`${idPrefix}-${firstInvalid}`)?.focus()
      return
    }

    if (!CONTACT_ENDPOINT) {
      window.location.href = buildMailto(fields)
      setStatus({ kind: 'mail-opened' })
      return
    }

    setStatus({ kind: 'sending' })
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
      setStatus({ kind: 'sent' })
      setFields(EMPTY)
      setTouched({})
    } catch {
      setStatus({
        kind: 'error',
        text: `The message could not be sent. Please email me directly at ${profile.email}.`,
      })
    }
  }

  const copyMessage = async () => {
    const text = `To: ${profile.email}\nSubject: ${fields.subject}\n\n${fields.message}\n\nFrom: ${fields.name} <${fields.email}>`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      setCopied(false)
    }
  }

  const field = (key: keyof Fields, label: string, type: 'text' | 'email' | 'textarea', autoComplete?: string) => {
    const id = `${idPrefix}-${key}`
    const error = touched[key] ? errors[key] : undefined
    const common = {
      id,
      name: key,
      value: fields[key],
      required: true,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${id}-error` : undefined,
      onBlur: () => blur(key),
    }
    return (
      <div className={`field${error ? ' has-error' : ''}${type === 'textarea' ? ' field-wide' : ''}`}>
        <label htmlFor={id}>{label}</label>
        {type === 'textarea' ? (
          <textarea {...common} rows={4} onChange={(e) => update(key, e.target.value)} />
        ) : (
          <input {...common} type={type} autoComplete={autoComplete} onChange={(e) => update(key, e.target.value)} />
        )}
        {error && (
          <p className="field-error" id={`${id}-error`}>
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate aria-label="Contact form">
      <div className="field-grid">
        {field('name', 'Your name', 'text', 'name')}
        {field('email', 'Your email', 'email', 'email')}
        {field('subject', 'Subject', 'text')}
        {field('message', 'Message', 'textarea')}
      </div>

      <div className="form-actions">
        <button className="button" type="submit" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : CONTACT_ENDPOINT ? 'Send message' : 'Open in my email app'}
        </button>
        {!CONTACT_ENDPOINT && (
          <p className="form-hint">This opens your own email app with the message filled in.</p>
        )}
      </div>

      <div className="form-status" role="status" aria-live="polite">
        {status.kind === 'sent' && <p className="status-ok">Thank you. Your message has been sent.</p>}
        {status.kind === 'error' && <p className="status-error">{status.text}</p>}
        {status.kind === 'mail-opened' && (
          <div className="status-ok">
            <p>
              Your email app should now be open with the message ready. It is only sent once you press send there.
            </p>
            <p>
              Nothing opened? Email me at{' '}
              <a className="text-link" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>{' '}
              or{' '}
              <button type="button" className="link-button" onClick={copyMessage}>
                {copied ? 'copied to clipboard' : 'copy the message'}
              </button>
              .
            </p>
          </div>
        )}
      </div>
    </form>
  )
}
