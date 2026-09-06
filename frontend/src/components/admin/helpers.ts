import { useTranslation } from 'react-i18next'

export function usePaginationLabels(from: number, to: number, total: number, page: number, totalPages: number) {
  const { t } = useTranslation()
  return {
    pageSize: t('listings.pageSize'),
    showing: t('listings.showingRange', { from, to, total }),
    previous: t('listings.previousPage'),
    next: t('listings.nextPage'),
    pageOf: t('listings.pageOf', { page, totalPages }),
    perPageOption: (count: number) => t('listings.perPageOption', { count }),
  }
}

export function selectString(setter: (value: string) => void) {
  return (value: string | number) => setter(String(value))
}

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const

export function getYearOptions(currentYear = new Date().getFullYear(), span = 3) {
  return Array.from({ length: span }, (_, i) => {
    const year = currentYear - i
    return { value: String(year), label: String(year) }
  })
}

export function getMonthOptions(t: (key: string) => string) {
  return MONTH_KEYS.map((key, index) => ({
    value: String(index + 1),
    label: t(`admin.months.${key}`),
  }))
}

/** Convert year/month filters to API date range (inclusive). */
export function periodToDateRange(year: string, month: string): { from?: string; to?: string } {
  if (!year) return {}
  const y = Number(year)
  if (!month) {
    return { from: `${y}-01-01`, to: `${y}-12-31T23:59:59.999Z` }
  }
  const m = Number(month)
  const lastDay = new Date(y, m, 0).getDate()
  const mm = String(m).padStart(2, '0')
  return {
    from: `${y}-${mm}-01`,
    to: `${y}-${mm}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`,
  }
}
