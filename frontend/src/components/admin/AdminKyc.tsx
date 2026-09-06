import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2 } from 'lucide-react'
import { adminApi } from '@/api/admin'
import { useLocaleText } from '@/hooks/useLocaleText'
import { localizedFarmerName } from '@/utils/localizedName'
import { resolveMediaUrl } from '@/utils/media'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from './shared'
import { cn } from '@/lib/utils'

export function AdminKyc() {
  const { t, isTamil } = useLocaleText()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kyc-pending'],
    queryFn: adminApi.getPendingKyc,
  })

  const review = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: 'APPROVED' | 'REJECTED'; note?: string }) =>
      adminApi.reviewKyc(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
  })

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
      {isLoading ? (
        <Skeleton className="h-48" />
      ) : !data?.length ? (
        <EmptyState message={t('admin.noPendingKyc')} />
      ) : (
        <div className="space-y-4">
          {data.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-border/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className={cn('font-semibold', isTamil && doc.userNameTamil && 'font-tamil')}>
                    {localizedFarmerName(doc.userName, doc.userNameTamil, isTamil)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {doc.type.replace(/_/g, ' ')} · {doc.district} · {doc.userRole}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{doc.fileName}</p>
                </div>
                <Badge variant="muted">{t('admin.kyc.PENDING')}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={resolveMediaUrl(doc.fileUrl)} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1 h-4 w-4" />
                    {t('admin.viewDocument')}
                  </a>
                </Button>
                <Button
                  size="sm"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: doc.id, status: 'APPROVED' })}
                >
                  {review.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('admin.approveKyc')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ id: doc.id, status: 'REJECTED', note: 'Document unclear or invalid' })}
                >
                  {t('admin.rejectKyc')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      </CardContent>
    </Card>
  )
}
