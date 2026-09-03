import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { listingsApi, type Listing } from '@/api/listings'
import { marketApi } from '@/api/market'
import { useAuth } from '@/store/auth'
import { TN_DISTRICTS } from '@/constants/districts'
import { formatCurrency } from '@/lib/utils'
import { getCropEmoji, formatDate } from '@/utils/listings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

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

export function FarmerListingsPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isTamil = i18n.language?.startsWith('ta')

  const [editing, setEditing] = useState<Listing | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState('')

  const { data: crops } = useQuery({
    queryKey: ['crops'],
    queryFn: marketApi.getCrops,
  })

  const { data: listings, isLoading } = useQuery({
    queryKey: ['farmer-listings'],
    queryFn: listingsApi.getMine,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...emptyForm, district: user?.district ?? 'Krishnagiri' },
  })

  const createMutation = useMutation({
    mutationFn: listingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-listings'] })
      setShowForm(false)
      setEditing(null)
      reset({ ...emptyForm, district: user?.district ?? 'Krishnagiri' })
      setSuccess(t('listings.created'))
      setTimeout(() => setSuccess(''), 3000)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormValues }) => listingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-listings'] })
      setShowForm(false)
      setEditing(null)
      reset({ ...emptyForm, district: user?.district ?? 'Krishnagiri' })
      setSuccess(t('listings.updated'))
      setTimeout(() => setSuccess(''), 3000)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: listingsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farmer-listings'] }),
  })

  const startCreate = () => {
    setEditing(null)
    reset({
      ...emptyForm,
      district: user?.district ?? 'Krishnagiri',
      cropId: crops?.[0]?.id ?? '',
    })
    setShowForm(true)
  }

  const startEdit = (listing: Listing) => {
    setEditing(listing)
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
      updateMutation.mutate({ id: editing.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const locale = isTamil ? 'ta-IN' : 'en-IN'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-tamil text-2xl font-bold text-primary sm:text-3xl">
            {t('nav.myProduce')}
          </h1>
          <p className="mt-1 text-muted-foreground">{t('listings.farmerSubtitle')}</p>
        </div>
        <Button onClick={startCreate} className="font-tamil">
          <Plus className="h-4 w-4" />
          {t('listings.addListing')}
        </Button>
      </div>

      {success && (
        <p className="rounded-xl bg-success/10 p-3 text-sm text-success">{success}</p>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? t('listings.editListing') : t('listings.newListing')}</CardTitle>
            <CardDescription>{t('listings.formHint')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('listings.filterCrop')}</label>
                <Select {...register('cropId')}>
                  {crops?.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {isTamil ? crop.nameTamil : crop.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('listings.variety')}</label>
                <Input {...register('variety')} placeholder={t('listings.varietyPlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('listings.quantity')}</label>
                <Input type="number" min="1" step="1" {...register('quantity')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('listings.price')}</label>
                <Input type="number" min="1" step="0.5" {...register('expectedPrice')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.district')}</label>
                <Select {...register('district')}>
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('listings.harvestDate')}</label>
                <Input type="date" {...register('harvestDate')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('listings.availableFrom')}</label>
                <Input type="date" {...register('availableFrom')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('listings.availableUntil')}</label>
                <Input type="date" {...register('availableUntil')} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">{t('listings.description')}</label>
                <Textarea rows={3} {...register('description')} />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? t('listings.saveChanges') : t('listings.createListing')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                >
                  {t('listings.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : listings?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('listings.noListings')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings?.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getCropEmoji(listing.crop.name)}</span>
                  <div>
                    <p className="font-tamil font-bold">
                      {isTamil ? listing.crop.nameTamil : listing.crop.name}
                      {listing.variety ? ` · ${listing.variety}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {listing.quantity.toLocaleString()} {listing.unit} ·{' '}
                      {formatCurrency(listing.expectedPrice)}/{listing.unit} · {listing.district}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(listing.createdAt, locale)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={listing.status === 'ACTIVE' ? 'success' : 'muted'}>
                    {listing.status}
                  </Badge>
                  <Button variant="outline" size="icon" onClick={() => startEdit(listing)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (confirm(t('listings.confirmDelete'))) {
                        deleteMutation.mutate(listing.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
