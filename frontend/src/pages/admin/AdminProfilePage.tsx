import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, Loader2, Shield } from 'lucide-react'
import { profileApi } from '@/api/profile'
import { authApi } from '@/api/auth'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ProfileHeroCard } from '@/components/profile/ProfileHeroCard'
import { useLocaleText } from '@/hooks/useLocaleText'
import { useAuth } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormDropdownSelect } from '@/components/ui/form-dropdown-select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/utils/listings'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  language: z.enum(['en', 'ta']),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export function AdminProfilePage() {
  const { t, i18n } = useTranslation()
  const { refreshUser } = useAuth()
  const { textClass } = useLocaleText()
  const queryClient = useQueryClient()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: profileApi.getAdminProfile,
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { isSubmitting: isPasswordSubmitting, isDirty: isPasswordDirty },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        phone: profile.phone || '',
        language: profile.language as 'en' | 'ta',
      })
    }
  }, [profile, reset])

  const invalidateProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
    await queryClient.invalidateQueries({ queryKey: ['dashboard-profile-panel'] })
    await refreshUser()
  }

  const profileMutation = useMutation({
    mutationFn: profileApi.updateAdminProfile,
    onSuccess: async (data) => {
      queryClient.setQueryData(['admin-profile'], data)
      await invalidateProfile()
      if (data.language !== i18n.language) {
        void i18n.changeLanguage(data.language)
      }
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    },
  })

  const avatarMutation = useMutation({
    mutationFn: profileApi.uploadAdminAvatar,
    onSuccess: async (data) => {
      queryClient.setQueryData(['admin-profile'], data)
      await invalidateProfile()
    },
  })

  const passwordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: async () => {
      resetPassword()
      setPasswordError(null)
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: (err: Error) => {
      setPasswordError(err.message)
    },
  })

  const languageOptions = useMemo(
    () => [
      { value: 'ta' as const, label: t('common.tamil') },
      { value: 'en' as const, label: t('common.english') },
    ],
    [t]
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">{t('admin.loadFailed')}</p>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('nav.profile')} description={t('profile.adminSubtitle')} />

      <ProfileHeroCard
        name={profile.name}
        email={profile.email}
        phone={profile.phone || undefined}
        profileImageUrl={profile.profileImageUrl}
        isVerified
        subtitle={profile.adminRoleName ?? t('panel.roleAdmin')}
        textClass={textClass}
        isUploadingAvatar={avatarMutation.isPending}
        onUploadAvatar={(file) => avatarMutation.mutate(file)}
        infoMessage={t('profile.adminInfoBox')}
        labels={{
          verified: t('panel.roleAdmin'),
          uploadPhoto: t('profile.uploadPhoto'),
          changePhoto: t('profile.changePhoto'),
          memberSinceText: t('profile.memberSince', { date: formatDate(profile.createdAt) }),
          lastUpdatedText: t('profile.lastUpdated', { date: formatDate(profile.updatedAt) }),
          photoFormats: t('profile.photoFormats'),
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className={textClass}>{t('profile.detailsTitle')}</CardTitle>
            <CardDescription>{t('profile.adminDetailsSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={handleSubmit((values) =>
                profileMutation.mutate({
                  name: values.name,
                  phone: values.phone?.trim() || undefined,
                  language: values.language,
                })
              )}
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('auth.email')}</label>
                <Input value={profile.email} disabled readOnly />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.name')}</label>
                <Input {...register('name')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.phone')}</label>
                <Input {...register('phone')} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('common.language')}</label>
                <FormDropdownSelect
                  name="language"
                  control={control}
                  options={languageOptions}
                  ariaLabel={t('common.language')}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t('profile.save')}
                </Button>
                {profileSuccess ? (
                  <span className="text-sm font-medium text-emerald-600">{t('profile.saved')}</span>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <CardTitle className={textClass}>{t('profile.changePassword')}</CardTitle>
            </div>
            <CardDescription>{t('profile.changePasswordDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={handlePasswordSubmit((values) => {
                setPasswordError(null)
                passwordMutation.mutate(values)
              })}
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.currentPassword')}</label>
                <Input type="password" autoComplete="current-password" {...registerPassword('currentPassword')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.newPassword')}</label>
                <Input type="password" autoComplete="new-password" {...registerPassword('newPassword')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.confirmPassword')}</label>
                <Input type="password" autoComplete="new-password" {...registerPassword('confirmPassword')} />
              </div>
              {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={isPasswordSubmitting || !isPasswordDirty}>
                  {isPasswordSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t('profile.updatePassword')}
                </Button>
                {passwordSuccess ? (
                  <span className="text-sm font-medium text-emerald-600">{t('profile.passwordUpdated')}</span>
                ) : null}
              </div>
            </form>

            <div className={cn('mt-6 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground')}>
              <p className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {t('profile.adminSecurityHint')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
