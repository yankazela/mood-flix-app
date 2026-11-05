export interface LegalSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface LegalDocument {
  title: string
  intro: string
  sections: LegalSection[]
}

/** Values filled into the text at render time; see lib/legal/config.ts. */
export type LegalTokens = Record<'operator' | 'contact' | 'updated' | 'jurisdiction', string>
