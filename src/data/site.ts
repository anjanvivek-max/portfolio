/**
 * Site-level configuration.
 *
 * CONTACT_ENDPOINT
 *   Leave as `null` to use the honest mailto fallback: the form opens the visitor's own
 *   email app with the message filled in, and nothing is claimed to be "sent".
 *
 *   To send messages directly, set this to a form backend URL that accepts a JSON POST,
 *   for example a Formspree endpoint: 'https://formspree.io/f/your-form-id'.
 */
export const CONTACT_ENDPOINT: string | null = null

export const LOADING_LINE = "LOADING VIVEK'S DIGITAL WORLD..."

export const STORAGE_KEYS = {
  mode: 'vivek.mode',
  skipIntro: 'vivek.skipIntro',
} as const

/** Resolves a path under `public/` so it works at any deploy base path. */
export const asset = (path: string): string => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
