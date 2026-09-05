import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  X,
  Store,
  MapPin,
  Sprout,
  BadgeCheck,
  IndianRupee,
  Package,
  LayoutGrid,
  List,
} from 'lucide-react'
import { listingsApi } from '@/api/listings'
import { marketApi } from '@/api/market'
import { TN_DISTRICTS } from '@/constants/districts'
import { useLocaleText } from '@/hooks/useLocaleText'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { MarketPriceTicker } from '@/components/marketplace/MarketPriceTicker'
import { Input } from '@/components/ui/input'
import { DropdownSelect } from '@/components/ui/dropdown-select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { PaginationControls } from '@/components/ui/pagination'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [6, 12, 24]

type PricePreset = '' | 'budget' | 'mid' | 'premium'

interface MarketplaceBrowseProps {
  variant?: 'public' | 'dashboard'
  basePath?: string
}

function FiltersBar({
  searchInput,
  onSearchChange,
  cropId,
  onCropChange,
  district,
  onDistrictChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  minQuantity,
  onMinQuantityChange,
  availableOnly,
  onAvailableOnlyChange,
  pricePreset,
  onPricePresetChange,
  cropOptions,
  districtOptions,
  onClear,
  activeFilterCount,
  t,
}: {
  searchInput: string
  onSearchChange: (value: string) => void
  cropId: string
  onCropChange: (value: string) => void
  district: string
  onDistrictChange: (value: string) => void
  minPrice: string
  maxPrice: string
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  minQuantity: string
  onMinQuantityChange: (value: string) => void
  availableOnly: boolean
  onAvailableOnlyChange: (value: boolean) => void
  pricePreset: PricePreset
  onPricePresetChange: (preset: PricePreset) => void
  cropOptions: { value: string; label: string }[]
  districtOptions: { value: string; label: string }[]
  onClear: () => void
  activeFilterCount: number
  t: (key: string, opts?: Record<string, unknown>) => string
}) {
  const pricePresets: { key: PricePreset; label: string }[] = [
    { key: '', label: t('listings.priceAny') },
    { key: 'budget', label: t('listings.priceBudget') },
    { key: 'mid', label: t('listings.priceMid') },
    { key: 'premium', label: t('listings.pricePremium') },
  ]

  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 pl-10"
            placeholder={t('listings.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="w-full min-w-[10rem] sm:w-44">
          <DropdownSelect
            value={cropId}
            options={cropOptions}
            onChange={onCropChange}
            ariaLabel={t('listings.filterCrop')}
            fullWidth
            align="left"
          />
        </div>
        <div className="w-full min-w-[10rem] sm:w-44">
          <DropdownSelect
            value={district}
            options={districtOptions}
            onChange={onDistrictChange}
            ariaLabel={t('profile.district')}
            fullWidth
            align="left"
          />
        </div>
        <div className="relative w-full min-w-[8rem] sm:w-32">
          <Package className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="number"
            min="0"
            className="h-11 pl-8"
            placeholder={t('listings.minQuantity')}
            value={minQuantity}
            onChange={(e) => onMinQuantityChange(e.target.value)}
          />
        </div>
        <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3">
          <span className="whitespace-nowrap text-sm font-medium">{t('listings.availableNow')}</span>
          <ToggleSwitch checked={availableOnly} onChange={onAvailableOnlyChange} />
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="h-11" onClick={onClear}>
            <X className="mr-1 h-4 w-4" />
            {t('listings.clearFilters')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <IndianRupee className="h-3.5 w-3.5" />
          {t('listings.priceRange')}
        </span>
        {pricePresets.map((preset) => (
          <button
            key={preset.key || 'any'}
            type="button"
            onClick={() => onPricePresetChange(preset.key)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              pricePreset === preset.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
            )}
          >
            {preset.label}
          </button>
        ))}
        <Input
          type="number"
          min="0"
          className="h-8 w-24"
          placeholder={t('listings.minPrice')}
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          min="0"
          className="h-8 w-24"
          placeholder={t('listings.maxPrice')}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export function MarketplaceBrowse({ variant = 'public', basePath = '/marketplace' }: MarketplaceBrowseProps) {
  const { t, isTamil, textClass } = useLocaleText()
  const isDashboard = variant === 'dashboard'

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [cropId, setCropId] = useState('')
  const [district, setDistrict] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [availableOnly, setAvailableOnly] = useState(true)
  const [pricePreset, setPricePreset] = useState<PricePreset>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const applyPricePreset = (preset: PricePreset) => {
    setPricePreset(preset)
    setPage(1)
    if (preset === '') {
      setMinPrice('')
      setMaxPrice('')
    } else if (preset === 'budget') {
      setMinPrice('')
      setMaxPrice('30')
    } else if (preset === 'mid') {
      setMinPrice('30')
      setMaxPrice('50')
    } else if (preset === 'premium') {
      setMinPrice('50')
      setMaxPrice('')
    }
  }

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value)
    setPricePreset('')
    setPage(1)
  }

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value)
    setPricePreset('')
    setPage(1)
  }

  const { data: crops } = useQuery({
    queryKey: ['crops'],
    queryFn: marketApi.getCrops,
  })

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      cropId: cropId || undefined,
      district: district || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minQuantity: minQuantity ? Number(minQuantity) : undefined,
      available: availableOnly,
      page,
      limit,
    }),
    [debouncedSearch, cropId, district, minPrice, maxPrice, minQuantity, availableOnly, page, limit]
  )

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['marketplace', queryParams],
    queryFn: () => listingsApi.browse(queryParams),
  })

  const cropOptions = useMemo(
    () => [
      { value: '', label: t('listings.allCrops') },
      ...(crops?.map((crop) => ({
        value: crop.id,
        label: isTamil ? crop.nameTamil : crop.name,
      })) ?? []),
    ],
    [crops, isTamil, t]
  )

  const districtOptions = useMemo(
    () => [
      { value: '', label: t('listings.allDistricts') },
      ...TN_DISTRICTS.map((d) => ({ value: d, label: d })),
    ],
    [t]
  )

  const listings = data?.listings ?? []
  const priceTicker = data?.priceTicker ?? []
  const pagination = data?.pagination
  const total = pagination?.total ?? 0
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0

  const activeFilterCount = [
    debouncedSearch,
    cropId,
    district,
    minPrice,
    maxPrice,
    minQuantity,
    !availableOnly,
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setCropId('')
    setDistrict('')
    setMinPrice('')
    setMaxPrice('')
    setMinQuantity('')
    setAvailableOnly(true)
    setPricePreset('')
    setPage(1)
  }

  const popularCrops = crops?.slice(0, 8) ?? []

  const filterBarProps = {
    searchInput,
    onSearchChange: setSearchInput,
    cropId,
    onCropChange: (value: string) => {
      setCropId(value)
      setPage(1)
    },
    district,
    onDistrictChange: (value: string) => {
      setDistrict(value)
      setPage(1)
    },
    minPrice,
    maxPrice,
    onMinPriceChange: handleMinPriceChange,
    onMaxPriceChange: handleMaxPriceChange,
    minQuantity,
    onMinQuantityChange: (value: string) => {
      setMinQuantity(value)
      setPage(1)
    },
    availableOnly,
    onAvailableOnlyChange: (value: boolean) => {
      setAvailableOnly(value)
      setPage(1)
    },
    pricePreset,
    onPricePresetChange: applyPricePreset,
    cropOptions,
    districtOptions,
    onClear: clearFilters,
    activeFilterCount,
    t,
  }

  const resultsSection = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-3 py-2.5 shadow-sm">
        <p className={cn('text-sm font-medium text-foreground', textClass)}>
          {!isLoading && !error && total > 0
            ? t('listings.resultsCount', { count: total })
            : t('listings.marketplaceSubtitle')}
        </p>
        <div className="flex items-center rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={t('listings.gridView')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={t('listings.listView')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {popularCrops.length > 0 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => {
              setCropId('')
              setPage(1)
            }}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
              !cropId
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground'
            )}
          >
            {t('listings.allCrops')}
          </button>
          {popularCrops.map((crop) => {
            const label = isTamil ? crop.nameTamil : crop.name
            const isActive = cropId === crop.id
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => {
                  setCropId(isActive ? '' : crop.id)
                  setPage(1)
                }}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30',
                  textClass
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {debouncedSearch && (
            <Badge variant="muted" className="gap-1">
              {debouncedSearch}
              <button type="button" onClick={() => setSearchInput('')} aria-label={t('listings.clearFilters')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {cropId && (
            <Badge variant="muted" className="gap-1">
              {cropOptions.find((o) => o.value === cropId)?.label}
              <button type="button" onClick={() => setCropId('')} aria-label={t('listings.clearFilters')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {district && (
            <Badge variant="muted" className="gap-1">
              {district}
              <button type="button" onClick={() => setDistrict('')} aria-label={t('listings.clearFilters')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(minPrice || maxPrice) && (
            <Badge variant="muted" className="gap-1">
              ₹{minPrice || '0'}–{maxPrice || '∞'}
              <button
                type="button"
                onClick={() => {
                  setMinPrice('')
                  setMaxPrice('')
                  setPricePreset('')
                }}
                aria-label={t('listings.clearFilters')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFilters}>
            {t('listings.clearFilters')}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          )}
        >
          {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
            <Skeleton key={i} className={cn('rounded-2xl', viewMode === 'list' ? 'h-28' : 'h-[20rem]')} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-12 text-center">
          <p className="text-destructive">{t('common.error')}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-16 text-center">
          <Store className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className={cn('text-sm text-muted-foreground', textClass)}>{t('listings.noResults')}</p>
          {activeFilterCount > 0 && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              {t('listings.clearFilters')}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            className={cn(
              'grid gap-4',
              viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
              isFetching && 'opacity-70'
            )}
          >
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} basePath={basePath} variant={viewMode} />
            ))}
          </div>

          {pagination && (
            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit)
                setPage(1)
              }}
              limitOptions={PAGE_SIZE_OPTIONS}
              labels={{
                pageSize: t('listings.pageSize'),
                showing: t('listings.showingRange', { from, to, total: pagination.total }),
                previous: t('listings.previousPage'),
                next: t('listings.nextPage'),
                pageOf: t('listings.pageOf', {
                  page: pagination.page,
                  totalPages: pagination.totalPages,
                }),
                perPageOption: (count) => t('listings.perPageOption', { count }),
              }}
              className="mt-6"
            />
          )}
        </>
      )}
    </>
  )

  return (
    <div className={cn('space-y-6', !isDashboard && 'mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8')}>
      {isDashboard ? (
        <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary via-primary to-secondary p-5 text-primary-foreground sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/75">
                {t('listings.browseFresh')}
              </p>
              <h1 className={cn('mt-1 text-2xl font-bold sm:text-3xl', textClass)}>{t('nav.marketplace')}</h1>
              <p className={cn('mt-2 max-w-xl text-sm text-primary-foreground/85', textClass)}>
                {t('listings.marketplaceDashboardDesc')}
              </p>
            </div>
            {total > 0 && (
              <div className="flex gap-2">
                {[
                  { label: t('listings.freshListings'), value: total, icon: Sprout },
                  { label: t('listings.districtsCovered'), value: new Set(listings.map((l) => l.district)).size || '18+', icon: MapPin },
                  { label: t('listings.verifiedListings'), value: listings.filter((l) => l.farmer.isVerified).length, icon: BadgeCheck },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="min-w-[5.5rem] rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <Icon className="mb-1 h-3.5 w-3.5 text-white/80" />
                    <p className="text-lg font-bold tabular-nums leading-none">{value}</p>
                    <p className="mt-1 text-[10px] font-medium text-white/75">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary via-primary to-secondary p-5 text-primary-foreground sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground/75">
              <Store className="h-3.5 w-3.5" />
              {t('listings.browseFresh')}
            </p>
            <h1 className={cn('mt-2 text-3xl font-bold sm:text-4xl', textClass)}>{t('nav.marketplace')}</h1>
            <p className={cn('mt-2 text-sm text-primary-foreground/85 sm:text-base', textClass)}>
              {t('listings.marketplaceHeroDesc')}
            </p>
          </div>
        </section>
      )}

      <MarketPriceTicker moves={priceTicker} />
      <FiltersBar {...filterBarProps} />
      {resultsSection}
    </div>
  )
}
