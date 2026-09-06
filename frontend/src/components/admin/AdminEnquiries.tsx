import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  Loader2,
  Mail,
  Phone,
  User,
  MessageSquare,
  CalendarDays,
  CheckCircle2,
  Clock,
  Inbox,
  Send,
} from 'lucide-react'
import { adminApi, type AdminEnquiry, type EnquiryStatus } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { formatDate } from '@/utils/listings'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { Textarea } from '@/components/ui/textarea'
import { PaginationControls } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  AdminFilterBar,
  AdminFilterSearch,
  AdminKpiCard,
  AdminQueryError,
  EmptyState,
} from './shared'
import { selectString, usePaginationLabels } from './helpers'
import { cn } from '@/lib/utils'

const STATUS_VARIANT: Record<EnquiryStatus, 'muted' | 'secondary' | 'success' | 'outline' | 'accent'> = {
  OPEN: 'accent',
  IN_PROGRESS: 'secondary',
  RESOLVED: 'success',
  CLOSED: 'outline',
}

const STATUS_ACCENT: Record<EnquiryStatus, string> = {
  OPEN: 'border-l-accent',
  IN_PROGRESS: 'border-l-primary',
  RESOLVED: 'border-l-emerald-500',
  CLOSED: 'border-l-muted-foreground/40',
}

type StatusFilter = '' | EnquiryStatus

function EnquiryCard({
  enquiry,
  locale,
  t,
  replyDraft,
  onReplyChange,
  onMarkInProgress,
  onMarkResolved,
  isUpdating,
}: {
  enquiry: AdminEnquiry
  locale: string
  t: (key: string) => string
  replyDraft: string
  onReplyChange: (value: string) => void
  onMarkInProgress: () => void
  onMarkResolved: () => void
  isUpdating: boolean
}) {
  const initial = enquiry.name.trim().charAt(0).toUpperCase() || '?'
  const isActionable = enquiry.status === 'OPEN' || enquiry.status === 'IN_PROGRESS'

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border border-border/80 border-l-4 bg-card transition-shadow hover:shadow-md',
        STATUS_ACCENT[enquiry.status]
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-base font-bold text-primary ring-1 ring-primary/15">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                  <h3 className="font-semibold leading-tight">{enquiry.subject}</h3>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(enquiry.createdAt, locale)}
                  </span>
                  {enquiry.resolvedAt ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t('admin.resolvedOn')}: {formatDate(enquiry.resolvedAt, locale)}
                    </span>
                  ) : null}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[enquiry.status]} className="shrink-0">
                {t(`admin.enquiry.${enquiry.status}`)}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1 text-xs">
                <User className="h-3 w-3 text-muted-foreground" />
                {enquiry.name}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1 text-xs">
                <Mail className="h-3 w-3 text-muted-foreground" />
                {enquiry.email}
              </span>
              {enquiry.phone ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1 text-xs">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {enquiry.phone}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('admin.customerMessage')}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{enquiry.message}</p>
        </div>

        {enquiry.adminReply ? (
          <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <Send className="h-3 w-3" />
              {t('admin.adminReply')}
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{enquiry.adminReply}</p>
          </div>
        ) : null}

        {isActionable ? (
          <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
            <Textarea
              placeholder={t('admin.replyPlaceholder')}
              value={replyDraft}
              onChange={(e) => onReplyChange(e.target.value)}
              rows={3}
              className="resize-none bg-background"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={isUpdating} onClick={onMarkInProgress}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : t('admin.markInProgress')}
              </Button>
              <Button
                size="sm"
                disabled={isUpdating || !replyDraft.trim()}
                onClick={onMarkResolved}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : t('admin.markResolved')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function AdminEnquiries() {
  const { t, locale } = useLocaleText()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(8)
  const [status, setStatus] = useState<StatusFilter>('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const params = useMemo(
    () => ({ page, limit, status: status || undefined, search: search || undefined }),
    [page, limit, status, search]
  )

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-enquiries', params],
    queryFn: () => adminApi.getEnquiries(params),
  })

  const update = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; status?: EnquiryStatus; adminReply?: string; adminNotes?: string }) =>
      adminApi.updateEnquiry(id, payload),
    onSuccess: (_data, variables) => {
      setReplyDrafts((prev) => {
        const next = { ...prev }
        delete next[variables.id]
        return next
      })
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })

  const pagination = data?.pagination
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0
  const paginationLabels = usePaginationLabels(from, to, pagination?.total ?? 0, pagination?.page ?? 1, pagination?.totalPages ?? 1)

  const statusTabs: { value: StatusFilter; label: string; count?: number }[] = [
    { value: '', label: t('admin.all'), count: data?.summary.total },
    { value: 'OPEN', label: t('admin.enquiry.OPEN'), count: data?.summary.open },
    { value: 'IN_PROGRESS', label: t('admin.enquiry.IN_PROGRESS'), count: data?.summary.inProgress },
    { value: 'RESOLVED', label: t('admin.enquiry.RESOLVED'), count: data?.summary.resolved },
    { value: 'CLOSED', label: t('admin.enquiry.CLOSED'), count: data?.summary.closed },
  ]

  return (
    <div className="space-y-5">
      {data?.summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminKpiCard label={t('admin.openEnquiries')} value={data.summary.open} icon={Inbox} accent="accent" />
          <AdminKpiCard label={t('admin.enquiry.IN_PROGRESS')} value={data.summary.inProgress} icon={Clock} />
          <AdminKpiCard label={t('admin.enquiry.RESOLVED')} value={data.summary.resolved} icon={CheckCircle2} accent="secondary" />
          <AdminKpiCard label={t('admin.totalEnquiries')} value={data.summary.total} icon={MessageSquare} accent="secondary" />
        </div>
      ) : null}

      <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-border/80 bg-muted/30 p-1">
        {statusTabs.map((tab) => {
          const active = status === tab.value
          return (
            <button
              key={tab.value || 'all'}
              type="button"
              onClick={() => {
                setStatus(tab.value)
                setPage(1)
              }}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4',
                active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {tab.count != null ? (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                    active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <AdminFilterBar>
        <AdminFilterSearch
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('admin.searchEnquiries')}
        />
        <DropdownSelect
          size="md"
          ariaLabel={t('admin.status')}
          value={status}
          onChange={(v) => {
            selectString((val) => setStatus(val as StatusFilter))(v)
            setPage(1)
          }}
          options={[
            { value: '', label: t('admin.all') },
            { value: 'OPEN', label: t('admin.enquiry.OPEN') },
            { value: 'IN_PROGRESS', label: t('admin.enquiry.IN_PROGRESS') },
            { value: 'RESOLVED', label: t('admin.enquiry.RESOLVED') },
            { value: 'CLOSED', label: t('admin.enquiry.CLOSED') },
          ]}
        />
      </AdminFilterBar>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl border border-border/60" />
          ))}
        </div>
      ) : isError ? (
        <AdminQueryError
          message={error instanceof Error ? error.message : t('admin.loadFailed')}
          onRetry={() => refetch()}
          retryLabel={t('common.retry')}
        />
      ) : !data?.items.length ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState message={t('admin.noEnquiries')} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.items.map((enquiry) => (
            <EnquiryCard
              key={enquiry.id}
              enquiry={enquiry}
              locale={locale}
              t={t}
              replyDraft={replyDrafts[enquiry.id] ?? ''}
              onReplyChange={(value) => setReplyDrafts((prev) => ({ ...prev, [enquiry.id]: value }))}
              isUpdating={update.isPending}
              onMarkInProgress={() =>
                update.mutate({
                  id: enquiry.id,
                  status: 'IN_PROGRESS',
                  adminReply: replyDrafts[enquiry.id] || undefined,
                })
              }
              onMarkResolved={() =>
                update.mutate({
                  id: enquiry.id,
                  status: 'RESOLVED',
                  adminReply: replyDrafts[enquiry.id],
                })
              }
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
          onLimitChange={(v) => {
            setLimit(v)
            setPage(1)
          }}
          labels={paginationLabels}
        />
      ) : null}
    </div>
  )
}
