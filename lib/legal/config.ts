/**
 * Facts the legal pages need that the code cannot know. Set them in .env before release; the
 * fallbacks keep the text correct but generic.
 */

/** The person or company that runs UpMyMood, e.g. "UpMyMood (Pty) Ltd". */
export const LEGAL_OPERATOR = process.env.NEXT_PUBLIC_LEGAL_OPERATOR || 'UpMyMood'

/** Where people send privacy requests and questions. Shown as a mailto link. */
export const LEGAL_CONTACT_EMAIL = process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL || ''

/** ISO 3166-1 code of the country whose law governs the Terms, e.g. "ZA". Shown in the reader's language. Empty means the operator's country of establishment. */
export const LEGAL_JURISDICTION = (process.env.NEXT_PUBLIC_LEGAL_JURISDICTION || '').toUpperCase()

/** When the current versions took effect (ISO date). Change it whenever the text changes. */
export const LEGAL_UPDATED = '2026-11-03'
