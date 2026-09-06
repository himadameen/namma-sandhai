import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  IndianRupee,
  Lightbulb,
  Loader2,
  Package,
  Receipt,
  Sparkles,
  Users,
} from 'lucide-react'
import { adminApi, triggerCsvDownload } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { formatCurrency, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminKpiCard } from './shared'
import { getMonthOptions, getYearOptions, periodToDateRange, selectString } from './helpers'

type ReportKey = 'transactions' | 'revenue' | 'users' | 'listings'

type ReportDef = {
  key: ReportKey
  labelKey: string
  descKey: string
  includesKey: string
  icon: LucideIcon
  accent: 'primary' | 'secondary' | 'accent'
  statKey?: 'completedOrders' | 'totalSalesVolume' | 'totalUsers' | 'activeListings'
  fn: () => ReturnType<typeof adminApi.exportRevenue>
}

const STATIC_REPORTS: ReportDef[] = [
  {
    key: 'revenue',
    labelKey: 'admin.reportRevenue',
    descKey: 'admin.reportRevenueDesc',
    includesKey: 'admin.reportRevenueIncludes',
    icon: IndianRupee,
    accent: 'secondary',
    statKey: 'totalSalesVolume',
    fn: () => adminApi.exportRevenue(),
  },
  {
    key: 'users',
    labelKey: 'admin.reportUsers',
    descKey: 'admin.reportUsersDesc',
    includesKey: 'admin.reportUsersIncludes',
    icon: Users,
    accent: 'accent',
    statKey: 'totalUsers',
    fn: () => adminApi.exportUsers(),
  },
  {
    key: 'listings',
    labelKey: 'admin.reportListings',
    descKey: 'admin.reportListingsDesc',
    includesKey: 'admin.reportListingsIncludes',
    icon: Package,
    accent: 'primary',
    statKey: 'activeListings',
    fn: () => adminApi.exportListings(),
  },
]

const ACCENT_STYLES = {
  primary: {
    icon: 'from-primary/20 to-primary/5 text-primary',
    border: 'border-primary/20 hover:border-primary/35',
    stripe: 'from-primary via-primary/40 to-transparent',
  },
  secondary: {
    icon: 'from-secondary/20 to-secondary/5 text-secondary',
    border: 'border-secondary/20 hover:border-secondary/35',
    stripe: 'from-secondary via-secondary/40 to-transparent',
  },
  accent: {
    icon: 'from-accent/25 to-accent/5 text-accent-foreground',
    border: 'border-accent/25 hover:border-accent/40',
    stripe: 'from-accent via-accent/40 to-transparent',
  },
}

function ReportCard({
  title,
  description,
  includes,
  includesLabel,
  icon: Icon,
  accent,
  statLabel,
  statValue,
  isDownloading,
  onDownload,
  downloadLabel,
}: {
  title: string
  description: string
  includes: string
  includesLabel: string
  icon: LucideIcon
  accent: keyof typeof ACCENT_STYLES
  statLabel?: string
  statValue?: string | number
  isDownloading: boolean
  onDownload: () => void
  downloadLabel: string
}) {
  const styles = ACCENT_STYLES[accent]

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md',
        styles.border
      )}
    >
      <div className={cn('h-0.5 bg-gradient-to-r', styles.stripe)} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
              styles.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold">{title}</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                CSV
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {statLabel && statValue !== undefined ? (
          <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{statLabel}</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums">{statValue}</p>
          </div>
        ) : null}

        <div className="mt-4 flex-1 rounded-xl border border-dashed border-border/70 bg-muted/10 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{includesLabel}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{includes}</p>
        </div>

        <Button className="mt-4 w-full gap-2" disabled={isDownloading} onClick={onDownload}>
          {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloadLabel}
        </Button>
      </div>
    </article>
  )
}

export function AdminReports() {
  const { t } = useLocaleText()
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [activeDownload, setActiveDownload] = useState<ReportKey | null>(null)

  const yearOptions = useMemo(() => [{ value: '', label: t('admin.allYears') }, ...getYearOptions()], [t])
  const monthOptions = useMemo(
    () => [{ value: '', label: t('admin.allMonths') }, ...getMonthOptions(t)],
    [t]
  )

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
    staleTime: 60_000,
  })

  const periodLabel = useMemo(() => {
    if (!year) return t('admin.reportAllTime')
    const yearLabel = yearOptions.find((o) => o.value === year)?.label ?? year
    if (!month) return yearLabel
    const monthLabel = monthOptions.find((o) => o.value === month)?.label ?? month
    return `${monthLabel} ${yearLabel}`
  }, [year, month, yearOptions, monthOptions, t])

  async function handleDownload(key: ReportKey, fn: () => ReturnType<typeof adminApi.exportRevenue>) {
    setActiveDownload(key)
    try {
      const { blob, filename } = await fn()
      triggerCsvDownload(blob, filename)
    } finally {
      setActiveDownload(null)
    }
  }

  function getStatValue(key: ReportDef['statKey']) {
    if (!dashboard?.kpis || !key) return undefined
    if (key === 'totalSalesVolume') return formatCurrency(dashboard.kpis.totalSalesVolume)
    return dashboard.kpis[key]
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary via-primary to-secondary p-5 text-primary-foreground sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground/85">
              <Sparkles className="h-3.5 w-3.5" />
              {t('admin.reportExportCenter')}
            </div>
            <h2 className="mt-3 text-xl font-bold sm:text-2xl">{t('admin.reports')}</h2>
            <p className="mt-2 text-sm text-primary-foreground/85">{t('admin.reportExportCenterDesc')}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
        </div>
      </section>

      {dashboardLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[5.5rem] rounded-2xl" />
          ))}
        </div>
      ) : dashboard ? (
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard
            label={t('admin.completedOrders')}
            value={dashboard.kpis.completedOrders}
            icon={Receipt}
          />
          <AdminKpiCard
            label={t('admin.salesVolume')}
            value={formatCurrency(dashboard.kpis.totalSalesVolume)}
            icon={IndianRupee}
            accent="secondary"
          />
          <AdminKpiCard label={t('admin.totalUsers')} value={dashboard.kpis.totalUsers} icon={Users} accent="accent" />
          <AdminKpiCard label={t('admin.activeListings')} value={dashboard.kpis.activeListings} icon={Package} />
        </div>
      ) : null}

      <article className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
        <div className="h-0.5 bg-gradient-to-r from-primary via-secondary/60 to-primary/30" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">{t('admin.reportTransactions')}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    CSV
                  </span>
                </div>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t('admin.reportTransactionsDesc')}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t('admin.reportTransactionsIncludes')}</p>
              </div>
            </div>

            <div className="w-full shrink-0 rounded-2xl border border-border/70 bg-muted/15 p-4 lg:max-w-md">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-primary" />
                {t('admin.reportSelectPeriod')}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <DropdownSelect
                  size="md"
                  ariaLabel={t('admin.year')}
                  value={year}
                  onChange={(v) => {
                    selectString(setYear)(v)
                    if (!v) setMonth('')
                  }}
                  options={yearOptions}
                />
                <DropdownSelect
                  size="md"
                  ariaLabel={t('admin.month')}
                  value={month}
                  onChange={selectString(setMonth)}
                  options={monthOptions}
                  disabled={!year}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {t('admin.reportExportingFor')}: <span className="font-semibold text-foreground">{periodLabel}</span>
              </p>
              <Button
                className="mt-4 w-full gap-2"
                disabled={activeDownload === 'transactions'}
                onClick={() =>
                  handleDownload('transactions', () => {
                    const range = periodToDateRange(year, month)
                    return adminApi.exportTransactions({ from: range.from, to: range.to })
                  })
                }
              >
                {activeDownload === 'transactions' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {t('admin.downloadCsv')}
              </Button>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STATIC_REPORTS.map((report) => (
          <ReportCard
            key={report.key}
            title={t(report.labelKey)}
            description={t(report.descKey)}
            includes={t(report.includesKey)}
            includesLabel={t('admin.reportIncludes')}
            icon={report.icon}
            accent={report.accent}
            statLabel={t('admin.reportCurrentData')}
            statValue={getStatValue(report.statKey)}
            isDownloading={activeDownload === report.key}
            onDownload={() => handleDownload(report.key, report.fn)}
            downloadLabel={t('admin.downloadCsv')}
          />
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-dashed border-primary/25 bg-primary/5">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold">{t('admin.reportTipsTitle')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('admin.reportInsightsDesc')}</p>
            <ul className="mt-4 space-y-2.5">
              {[t('admin.reportTip1'), t('admin.reportTip2'), t('admin.reportTip3')].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
