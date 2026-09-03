import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { profileApi } from '@/api/profile'
import { useAuth } from '@/store/auth'
import { TN_DISTRICTS } from '@/constants/districts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  district: z.string().min(2),
  state: z.string().optional(),
  farmSize: z.string().optional(),
  cropsGrown: z.string().optional(),
  address: z.string().optional(),
  language: z.enum(['en', 'ta']),
})

type FormValues = z.infer<typeof schema>

export function FarmerProfilePage() {
  const { t, i18n } = useTranslation()
  const { refreshUser } = useAuth()
  const queryClient = useQueryClient()
  const [success, setSuccess] = useState(false)

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['farmer-profile'],
    queryFn: profileApi.getFarmerProfile,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        phone: profile.phone,
        district: profile.district,
        state: profile.state,
        farmSize: profile.farmSize ?? '',
        cropsGrown: profile.cropsGrown ?? '',
        address: profile.address ?? '',
        language: profile.language as 'en' | 'ta',
      })
    }
  }, [profile, reset])

  const mutation = useMutation({
    mutationFn: profileApi.updateFarmerProfile,
    onSuccess: async (data) => {
      queryClient.setQueryData(['farmer-profile'], data)
      await refreshUser()
      if (data.language !== i18n.language) {
        i18n.changeLanguage(data.language)
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{t('common.error')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-tamil text-2xl font-bold text-primary sm:text-3xl">
          {t('nav.profile')}
        </h1>
        <p className="mt-1 text-muted-foreground">{t('profile.farmerSubtitle')}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="font-tamil">{profile.name}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </div>
          {profile.isVerified && (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('common.verified')}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('auth.email')}</label>
              <Input value={profile.email} disabled />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('profile.name')}</label>
              <Input {...register('name')} className="font-tamil" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('profile.phone')}</label>
              <Input {...register('phone')} type="tel" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                <label className="mb-1.5 block text-sm font-medium">{t('profile.state')}</label>
                <Input {...register('state')} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('profile.farmSize')}</label>
              <Input {...register('farmSize')} placeholder={t('profile.farmSizePlaceholder')} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('profile.cropsGrown')}</label>
              <Input {...register('cropsGrown')} placeholder={t('profile.cropsPlaceholder')} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('profile.address')}</label>
              <Textarea {...register('address')} rows={3} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('common.language')}</label>
              <Select {...register('language')}>
                <option value="ta">{t('common.tamil')}</option>
                <option value="en">{t('common.english')}</option>
              </Select>
            </div>

            {mutation.error && (
              <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {mutation.error instanceof Error ? mutation.error.message : t('common.error')}
              </p>
            )}

            {success && (
              <p className="rounded-xl bg-success/10 p-3 text-sm text-success">
                {t('profile.saved')}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting || !isDirty} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('profile.save')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
