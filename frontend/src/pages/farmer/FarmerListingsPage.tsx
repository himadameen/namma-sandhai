import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  MapPin,
  Package,
  Calendar,
  Sprout,
  Eye,
} from 'lucide-react'
import { listingsApi, type Listing, type ListingMediaItem } from '@/api/listings'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useLocaleText } from '@/hooks/useLocaleText'
import { marketApi } from '@/api/market'
import { useAuth } from '@/store/auth'
import { TN_DISTRICTS } from '@/constants/districts'
import { formatCurrency } from '@/lib/utils'
import { formatDate } from '@/utils/listings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormDropdownSelect } from '@/components/ui/form-dropdown-select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PaginationControls } from '@/components/ui/pagination'
import { ListingMediaUploader } from '@/components/listings/ListingMediaUploader'
import { ListingMediaStrip } from '@/components/listings/ListingMediaStrip'
import { FarmerListingViewDialog } from '@/components/listings/FarmerListingViewDialog'
import { listingMediaItems } from '@/utils/media'
import { cn } from '@/lib/utils'

const schema = z.object({
  cropId: z.string().min(1),
  variety: z.string().optional(),
  quantity: z.coerce.number().positive(),
  expectedPrice: z.coerce.number().positive(),
  district: z.string().min(1),
  harvestDate: z.string().optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>
type StatusFilter = '' | Listing['status']

const emptyForm: FormValues = {
  cropId: '',
  variety: '',
  quantity: 0,
  expectedPrice: 0,
  district: '',
  harvestDate: '',
  availableFrom: '',
  availableUntil: '',
  description: '',
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]

function statusBadgeVariant(status: Listing['status']) {
  if (status === 'ACTIVE') return 'success' as const
  if (status === 'SOLD') return 'accent' as const
  return 'muted' as const
}

export function FarmerListingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { t, isTamil, textClass, locale } = useLocaleText()
  const [editing, setEditing] = useState<Listing | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [mediaItems, setMediaItems] = useState<ListingMediaItem[]>([])
  const [viewingListing, setViewingListing] = useState<Listing | null>(null)
  const [viewingMediaIndex, setViewingMediaIndex] = useState(0)

  const { data: crops } = useQuery({
    queryKey: ['crops'],
    queryFn: marketApi.getCrops,
  })

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status: statusFilter || undefined,
      search: debouncedSearch || undefined,
    }),
    [page, limit, statusFilter, debouncedSearch]
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['farmer-listings', queryParams],
    queryFn: () => listingsApi.getMine(queryParams),
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...emptyForm, district: user?.district ?? 'Krishnagiri' },
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (data && data.listings.length === 0 && page > 1) {
      setPage((current) => Math.max(1, current - 1))
    }
  }, [data, page])

  const invalidateListings = () => {
    queryClient.invalidateQueries({ queryKey: ['farmer-listings'] })
  }

  const createMutation = useMutation({
    mutationFn: listingsApi.create,
    onSuccess: () => {
      invalidateListings()
      setShowForm(false)
      setEditing(null)
      setPage(1)
      reset({ ...emptyForm, district: user?.district ?? 'Krishnagiri' })
      setMediaItems([])
      setSuccess(t('listings.created'))
      setTimeout(() => setSuccess(''), 3000)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload, media }: { id: string; data: FormValues; media: ListingMediaItem[] }) =>
      listingsApi.update(id, { ...payload, media }),
    onSuccess: () => {
      invalidateListings()
      setShowForm(false)
      setEditing(null)
      reset({ ...emptyForm, district: user?.district ?? 'Krishnagiri' })
      setMediaItems([])
      setSuccess(t('listings.updated'))
      setTimeout(() => setSuccess(''), 3000)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: listingsApi.delete,
    onSuccess: invalidateListings,
  })

  const startCreate = () => {
    setEditing(null)
    setMediaItems([])
    reset({
      ...emptyForm,
      district: user?.district ?? 'Krishnagiri',
      cropId: crops?.[0]?.id ?? '',
    })
    setShowForm(true)
  }

  const startEdit = (listing: Listing) => {
    setEditing(listing)
    setMediaItems(listingMediaItems(listing))
    reset({
      cropId: listing.crop.id,
      variety: listing.variety ?? '',
      quantity: listing.quantity,
      expectedPrice: listing.expectedPrice,
      district: listing.district,
      harvestDate: listing.harvestDate?.slice(0, 10) ?? '',
      availableFrom: listing.availableFrom?.slice(0, 10) ?? '',
      availableUntil: listing.availableUntil?.slice(0, 10) ?? '',
      description: listing.description ?? '',
    })
    setShowForm(true)
  }

  const onSubmit = (values: FormValues) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values, media: mediaItems })
    } else {
      createMutation.mutate({ ...values, media: mediaItems.length > 0 ? mediaItems : undefined })
    }
  }

  const mediaLabels = {
    title: t('listings.mediaTitle'),
    hint: t('listings.mediaHint'),
    upload: t('listings.mediaUpload'),
    uploading: t('listings.mediaUploading'),
    remove: t('listings.mediaRemove'),
    image: t('listings.mediaImage'),
    video: t('listings.mediaVideo'),
  }

  const cropOptions = useMemo(
    () =>
      crops?.map((crop) => ({
        value: crop.id,
        label: isTamil ? crop.nameTamil : crop.name,
      })) ?? [],
    [crops, isTamil]
  )

  const openListingView = (listing: Listing, mediaIndex = 0) => {
    setViewingMediaIndex(mediaIndex)
    setViewingListing(listing)
  }

  const districtOptions = useMemo(
    () => TN_DISTRICTS.map((d) => ({ value: d, label: d })),
    []
  )

  const viewingCropName = viewingListing
    ? isTamil
      ? viewingListing.crop.nameTamil
      : viewingListing.crop.name
    : ''

  const listings = data?.listings ?? []
  const pagination = data?.pagination
  const summary = data?.summary
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0

  const statusTabs: { key: StatusFilter; label: string; count?: number }[] = [
    { key: '', label: t('listings.allStatuses'), count: summary?.total },
    { key: 'ACTIVE', label: t('listings.activeListings'), count: summary?.active },
    { key: 'SOLD', label: t('listings.soldListings'), count: summary?.sold },
    { key: 'EXPIRED', label: t('listings.expiredListings'), count: summary?.expired },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.myProduce')}
        description={t('listings.farmerSubtitle')}
        actions={
          <Button onClick={startCreate} className={textClass}>
            <Plus className="h-4 w-4" />
            {t('listings.addListing')}
          </Button>
        }
      />

      {success && (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-sm leading-relaxed text-success">{success}</p>
      )}

      {summary && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            { label: t('listings.totalListings'), value: summary.total, icon: Sprout, tone: 'primary' },
            { label: t('listings.activeListings'), value: summary.active, icon: Package, tone: 'secondary' },
            { label: t('listings.soldListings'), value: summary.sold, icon: Package, tone: 'accent' },
            { label: t('listings.expiredListings'), value: summary.expired, icon: Calendar, tone: 'muted' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} className="border-border/80">
              <CardContent className="flex items-center gap-3.5 p-3.5 sm:p-4">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    tone === 'primary' && 'bg-primary/10 text-primary',
                    tone === 'secondary' && 'bg-secondary/10 text-secondary',
                    tone === 'accent' && 'bg-accent/15 text-accent-foreground',
                    tone === 'muted' && 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <p className={cn('text-xs font-medium leading-relaxed text-muted-foreground', textClass)}>{label}</p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums leading-none text-foreground">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Card className="mt-2">
          <CardHeader className="space-y-2.5 pt-6">
            <CardTitle className={textClass}>{editing ? t('listings.editListing') : t('listings.newListing')}</CardTitle>
            <CardDescription className={textClass}>{t('listings.formHint')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium leading-relaxed">{t('listings.filterCrop')}</label>
                <FormDropdownSelect
                  name="cropId"
                  control={control}
                  options={cropOptions}
                  ariaLabel={t('listings.filterCrop')}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium leading-relaxed">{t('listings.variety')}</label>
                <Input {...register('variety')} placeholder={t('listings.varietyPlaceholder')} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium leading-relaxed">{t('listings.quantity')}</label>
                <Input type="number" min="1" step="1" {...register('quantity')} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium leading-relaxed">{t('listings.price')}</label>
                <Input type="number" min="1" step="0.5" {...register('expectedPrice')} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium leading-relaxed">{t('profile.district')}</label>
                <FormDropdownSelect
                  name="district"
                  control={control}
                  options={districtOptions}
                  ariaLabel={t('profile.district')}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium leading-relaxed">{t('listings.harvestDate')}</label>
                <Input type="date" {...register('harvestDate')} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium leading-relaxed">{t('listings.availableFrom')}</label>
                <Input type="date" {...register('availableFrom')} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium leading-relaxed">{t('listings.availableUntil')}</label>
                <Input type="date" {...register('availableUntil')} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium leading-relaxed">{t('listings.description')}</label>
                <Textarea rows={3} {...register('description')} />
              </div>
              <div className="sm:col-span-2">
                <ListingMediaUploader
                  value={mediaItems}
                  onChange={setMediaItems}
                  labels={mediaLabels}
                  textClass={textClass}
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={isSubmitting} className={textClass}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? t('listings.saveChanges') : t('listings.createListing')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={textClass}
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                    setMediaItems([])
                  }}
                >
                  {t('listings.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="space-y-4 border-b border-border/50 pb-4 pt-6">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 pl-10"
              placeholder={t('listings.searchMyProduce')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isFetching && debouncedSearch && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-muted/30 p-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.key || 'all'}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key)
                  setPage(1)
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  statusFilter === tab.key
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className={textClass}>{tab.label}</span>
                {tab.count != null && (
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
                      statusFilter === tab.key ? 'bg-primary/10 text-primary' : 'bg-background text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pb-5 pt-8 sm:pt-10">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: limit }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
              <p className={cn('text-sm leading-relaxed text-muted-foreground', textClass)}>
                {debouncedSearch || statusFilter ? t('listings.noMatchingListings') : t('listings.noListings')}
              </p>
              {!debouncedSearch && !statusFilter && (
                <Button className={cn('mt-4', textClass)} onClick={startCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('listings.addListing')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className={cn('space-y-4', isFetching && 'opacity-60')}>
                {listings.map((listing) => {
                  const cropName = isTamil ? listing.crop.nameTamil : listing.crop.name
                  const estValue = listing.quantity * listing.expectedPrice
                  const media = listingMediaItems(listing)

                  return (
                    <article
                      key={listing.id}
                      className="rounded-xl border border-border/70 bg-card px-4 pb-4 pt-6 transition-colors hover:border-primary/25 hover:shadow-sm sm:px-5 sm:pb-5 sm:pt-7"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={cn('truncate text-base font-bold leading-snug text-foreground sm:text-lg', textClass)}>
                              {cropName}
                            </h3>
                            <Badge variant={statusBadgeVariant(listing.status)}>
                              {t(`listings.status.${listing.status}`)}
                            </Badge>
                          </div>
                          {listing.variety && (
                            <p className={cn('text-sm leading-relaxed text-muted-foreground', textClass)}>{listing.variety}</p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-primary"
                            onClick={() => openListingView(listing)}
                            aria-label={t('listings.viewListing')}
                            title={t('listings.viewListing')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-primary"
                            onClick={() => startEdit(listing)}
                            aria-label={t('listings.editListing')}
                            title={t('listings.editListing')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              if (confirm(t('listings.confirmDelete'))) {
                                deleteMutation.mutate(listing.id)
                              }
                            }}
                            aria-label={t('listings.deleteListing')}
                            title={t('listings.deleteListing')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                        <div className="min-w-0">
                          <dt className="text-xs font-medium leading-relaxed text-muted-foreground">{t('listings.quantity')}</dt>
                          <dd className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
                            {listing.quantity.toLocaleString(locale)} {listing.unit}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs font-medium leading-relaxed text-muted-foreground">{t('listings.price')}</dt>
                          <dd className="mt-0.5 text-sm font-semibold leading-snug text-secondary">
                            {formatCurrency(listing.expectedPrice)}/{listing.unit}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs font-medium leading-relaxed text-muted-foreground">{t('listings.totalValue')}</dt>
                          <dd className="mt-0.5 text-sm font-semibold leading-snug text-primary">{formatCurrency(estValue)}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs font-medium leading-relaxed text-muted-foreground">{t('profile.district')}</dt>
                          <dd className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold leading-snug text-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-destructive" />
                            <span className="truncate">{listing.district}</span>
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground">
                        <span>
                          {t('listings.listedOn')}: {formatDate(listing.createdAt, locale)}
                        </span>
                        {listing.harvestDate && (
                          <span>
                            {t('listings.harvestDate')}: {formatDate(listing.harvestDate, locale)}
                          </span>
                        )}
                        {listing.availableFrom && listing.availableUntil && (
                          <span>
                            {t('listings.availability')}: {formatDate(listing.availableFrom, locale)} –{' '}
                            {formatDate(listing.availableUntil, locale)}
                          </span>
                        )}
                      </div>

                      {listing.description && (
                        <p className={cn('mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground', textClass)}>
                          {listing.description}
                        </p>
                      )}

                      <div className="mt-4 border-t border-border/60 pt-4">
                        <p className={cn('mb-2 text-xs font-medium text-muted-foreground', textClass)}>
                          {t('listings.mediaTitle')}
                          {media.length > 0 && (
                            <span className="ml-1.5 tabular-nums text-foreground/70">({media.length})</span>
                          )}
                        </p>
                        <ListingMediaStrip
                          media={media}
                          alt={cropName}
                          placeholderLabel={t('listings.mediaPlaceholder')}
                          itemClassName="h-20 w-20 sm:h-24 sm:w-24"
                          onItemClick={(index) => openListingView(listing, index)}
                        />
                      </div>
                    </article>
                  )
                })}
              </div>

              {pagination && (
                <PaginationControls
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                  limitOptions={PAGE_SIZE_OPTIONS}
                  labels={{
                    pageSize: t('listings.pageSize'),
                    showing: t('listings.showingRange', { from, to, total: pagination.total }),
                    previous: t('listings.previousPage'),
                    next: t('listings.nextPage'),
                    pageOf: t('listings.pageOf', { page: pagination.page, totalPages: pagination.totalPages }),
                    perPageOption: (count) => t('listings.perPageOption', { count }),
                  }}
                  className="mt-5"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {viewingListing && (
        <FarmerListingViewDialog
          key={`${viewingListing.id}-${viewingMediaIndex}`}
          listing={viewingListing}
          cropName={viewingCropName}
          locale={locale}
          textClass={textClass}
          placeholderLabel={t('listings.mediaPlaceholder')}
          initialMediaIndex={viewingMediaIndex}
          labels={{
            quantity: t('listings.quantity'),
            price: t('listings.price'),
            totalValue: t('listings.totalValue'),
            district: t('profile.district'),
            listedOn: t('listings.listedOn'),
            harvestDate: t('listings.harvestDate'),
            availability: t('listings.availability'),
            description: t('listings.description'),
            close: t('listings.closeView'),
            status: (status) => t(`listings.status.${status}`),
          }}
          onClose={() => setViewingListing(null)}
        />
      )}
    </div>
  )
}
