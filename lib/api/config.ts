/** Where poster images live: the public posters/ prefix of the catalogue bucket. Override with NEXT_PUBLIC_POSTERS_BASE_URL. */
export const POSTERS_BASE_URL: string = (
  process.env.NEXT_PUBLIC_POSTERS_BASE_URL || 'https://movie-mood-storage-dev.s3.us-east-1.amazonaws.com'
).replace(/\/+$/, '')

export function posterUrlFor(posterKey: string | undefined): string | null {
  if (!posterKey) return null
  if (/^https?:\/\//.test(posterKey)) return posterKey
  return `${POSTERS_BASE_URL}/${posterKey.replace(/^\/+/, '')}`
}
