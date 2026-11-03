import { regionalTag, t } from '@/lib/i18n'

/** "in 25 minutes", "dans 6 heures", "en 6 horas", or "in a moment", from the ISO time the daily counter restarts. */
export function formatResetsIn(resetsAt: string, now: number = Date.now()): string {
  const ms = Date.parse(resetsAt) - now
  if (!Number.isFinite(ms) || ms <= 60_000) return t('common.soon')
  const minutes = Math.round(ms / 60_000)
  const format = new Intl.RelativeTimeFormat(regionalTag(), { numeric: 'always' })
  if (minutes < 60) return format.format(minutes, 'minute')
  return format.format(Math.round(minutes / 60), 'hour')
}

/** "24 Nov 2026" in the interface language. */
export function formatPlanDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(regionalTag(), { day: 'numeric', month: 'short', year: 'numeric' })
}

/** The unit of a store subscription period given in ISO 8601, e.g. "P1M" is a month. Returns a key: month, year or week. */
export function periodLabel(iso: string | null | undefined): 'month' | 'year' | 'week' {
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

/** The period's name in the interface language. */
export function periodName(period: string): string {
  return t(`billing.period.${period}`)
}
