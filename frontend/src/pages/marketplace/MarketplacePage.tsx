import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { listingsApi } from '@/api/listings'
import { marketApi } from '@/api/market'
import { TN_DISTRICTS } from '@/constants/districts'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function MarketplacePage() {
  const { t, i18n } = useTranslation()
  const isTamil = i18n.language?.startsWith('ta')

  const [search, setSearch] = useState('')
  const [cropId, setCropId] = useState('')
  const [district, setDistrict] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [availableOnly, setAvailableOnly] = useState(true)

  const [applied, setApplied] = useState({
    search: '',
    cropId: '',
    district: '',
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    availableOnly: true,
  })

  const { data: crops } = useQuery({
    queryKey: ['crops'],
    queryFn: marketApi.getCrops,
  })

  const queryParams = useMemo(
    () => ({
      search: applied.search || undefined,
      cropId: applied.cropId || undefined,
      district: applied.district || undefined,
      minPrice: applied.minPrice ? Number(applied.minPrice) : undefined,
      maxPrice: applied.maxPrice ? Number(applied.maxPrice) : undefined,
      minQuantity: applied.minQuantity ? Number(applied.minQuantity) : undefined,
      available: applied.availableOnly,
      limit: 24,
    }),
    [applied]
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ['marketplace', queryParams],
    queryFn: () => listingsApi.browse(queryParams),
  })

  const applyFilters = () => {
    setApplied({ search, cropId, district, minPrice, maxPrice, minQuantity, availableOnly })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-0 py-2 sm:px-0">
      <div>
        <h1 className="font-tamil text-3xl font-bold text-primary">{t('nav.marketplace')}</h1>
        <p className="mt-1 text-muted-foreground">{t('listings.marketplaceSubtitle')}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">{t('common.searchProduce')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder={t('listings.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('listings.filterCrop')}</label>
            <Select value={cropId} onChange={(e) => setCropId(e.target.value)}>
              <option value="">{t('listings.allCrops')}</option>
              {crops?.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {isTamil ? crop.nameTamil : crop.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('profile.district')}</label>
            <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">{t('listings.allDistricts')}</option>
              {TN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('listings.minPrice')}</label>
            <Input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('listings.maxPrice')}</label>
            <Input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t('listings.minQuantity')}</label>
            <Input type="number" min="0" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              {t('listings.availableNow')}
            </label>
          </div>
        </div>
        <Button className="mt-4" onClick={applyFilters}>
          {t('listings.applyFilters')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-destructive">{t('common.error')}</p>
      ) : data?.listings.length === 0 ? (
        <div className="rounded-2xl border border-border bg-muted/30 py-16 text-center">
          <p className="text-muted-foreground">{t('listings.noResults')}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {t('listings.resultsCount', { count: data?.pagination.total ?? 0 })}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
