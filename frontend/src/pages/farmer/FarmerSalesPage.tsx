import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Download, Loader2 } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji } from '@/utils/listings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function FarmerSalesPage() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')

  const { data, isLoading, error } = useQuery({
    queryKey: ['farmer-sales-records'],
    queryFn: dashboardApi.getFarmerSalesRecords,
  })

  const exportMutation = useMutation({
    mutationFn: dashboardApi.exportFarmerSalesCsv,
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    },
  })

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{t('common.error')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-tamil text-2xl font-bold text-primary sm:text-3xl">
            {t('nav.salesRecords')}
          </h1>
          <p className="mt-1 text-muted-foreground">{t('sales.subtitle')}</p>
        </div>
        <Button
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending || !data?.records.length}
        >
          {exportMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {t('sales.exportCsv')}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32" />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm text-muted-foreground">{t('sales.totalRecords')}</p>
                <p className="text-2xl font-bold">{data.summary.totalRecords}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm text-muted-foreground">{t('dashboard.totalRevenue')}</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(data.summary.totalRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm text-muted-foreground">{t('sales.totalQuantity')}</p>
                <p className="text-2xl font-bold">{data.summary.totalQuantity}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('sales.transactionHistory')}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {data.records.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">{t('dashboard.noSalesYet')}</p>
              ) : (
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">{t('sales.date')}</th>
                      <th className="pb-3 pr-4 font-medium">{t('listings.filterCrop')}</th>
                      <th className="pb-3 pr-4 font-medium">{t('sales.buyer')}</th>
                      <th className="pb-3 pr-4 font-medium">{t('requests.quantity')}</th>
                      <th className="pb-3 pr-4 font-medium">{t('listings.price')}</th>
                      <th className="pb-3 font-medium">{t('orders.total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record) => (
                      <tr key={record.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 whitespace-nowrap">
                          {new Date(record.soldAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{getCropEmoji(record.crop.name)}</span>
                            <span>{isTamil ? record.crop.nameTamil : record.crop.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">{record.buyerName}</td>
                        <td className="py-3 pr-4">
                          {record.quantity} {record.unit}
                        </td>
                        <td className="py-3 pr-4">
                          {formatCurrency(record.price)}/{record.unit}
                        </td>
                        <td className="py-3 font-semibold text-primary">
                          {formatCurrency(record.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
