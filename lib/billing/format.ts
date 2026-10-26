/** "in 25 min", "in 6 hours" or "in a moment", from the ISO time the daily counter restarts. */
export function formatResetsIn(resetsAt: string, now: number = Date.now()): string {
  const ms = Date.parse(resetsAt) - now
  if (!Number.isFinite(ms) || ms <= 60_000) return 'in a moment'
  const minutes = Math.round(ms / 60_000)
  if (minutes < 60) return `in ${minutes} min`
  const hours = Math.round(minutes / 60)
  return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`
}

/** "24 Nov 2026" in the person's locale. */
export function formatPlanDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** The unit of a store subscription period given in ISO 8601, e.g. "P1M" is a month. */
export function periodLabel(iso: string | null | undefined): string {
  switch (iso) {
    case 'P1Y':
      return 'year'
    case 'P1W':
    case 'P7D':
      return 'week'
    case 'P1M':
    default:
      return 'month'
  }
}
