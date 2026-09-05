import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import {
  profileApi,
  FARMER_DOCUMENT_TYPES,
  defaultKycSummary,
  type DocumentType,
  type KycStatus,
} from '@/api/profile'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ProfileHeroCard } from '@/components/profile/ProfileHeroCard'
import { KycStatusBanner } from '@/components/profile/KycStatusBanner'
import { KycDocumentsSection } from '@/components/profile/KycDocumentsSection'
import { useLocaleText } from '@/hooks/useLocaleText'
import { useAuth } from '@/store/auth'
import { TN_DISTRICTS } from '@/constants/districts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormDropdownSelect } from '@/components/ui/form-dropdown-select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/utils/listings'

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

function kycBannerContent(status: KycStatus, t: (key: string) => string) {
  const map: Record<KycStatus, { title: string; message: string }> = {
    NOT_STARTED: {
      title: t('profile.kyc.notStartedTitle'),
      message: t('profile.kyc.notStartedMessage'),
    },
    INCOMPLETE: {
      title: t('profile.kyc.incompleteTitle'),
      message: t('profile.kyc.incompleteMessage'),
    },
    SUBMITTED: {
      title: t('profile.kyc.submittedTitle'),
      message: t('profile.kyc.submittedMessage'),
    },
    VERIFIED: {
      title: t('profile.kyc.verifiedTitle'),
      message: t('profile.kyc.verifiedMessage'),
    },
  }
  return map[status]
}

export function FarmerProfilePage() {
  const { t, i18n } = useTranslation()
  const { refreshUser } = useAuth()
  const { textClass, locale } = useLocaleText()
  const queryClient = useQueryClient()
  const [success, setSuccess] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null)

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['farmer-profile'],
    queryFn: profileApi.getFarmerProfile,
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
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
      const stored = localStorage.getItem('namma-sandhai-language')
      if (!stored && (profile.language === 'en' || profile.language === 'ta')) {
        void i18n.changeLanguage(profile.language)
      }
    }
  }, [profile, reset, i18n])

  const invalidateProfile = async (data: Awaited<ReturnType<typeof profileApi.getFarmerProfile>>) => {
    queryClient.setQueryData(['farmer-profile'], data)
    await refreshUser()
  }

  const mutation = useMutation({
    mutationFn: profileApi.updateFarmerProfile,
    onSuccess: async (data) => {
      await invalidateProfile(data)
      if (data.language !== i18n.language) {
        i18n.changeLanguage(data.language)
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  const avatarMutation = useMutation({
    mutationFn: profileApi.uploadFarmerAvatar,
    onSuccess: invalidateProfile,
  })

  const documentMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: DocumentType }) =>
      profileApi.uploadFarmerDocument(file, type),
    onMutate: ({ type }) => setUploadingDoc(type),
    onSettled: () => setUploadingDoc(null),
    onSuccess: invalidateProfile,
  })

  const districtOptions = useMemo(
    () => TN_DISTRICTS.map((d) => ({ value: d, label: d })),
    []
  )

  const languageOptions = useMemo(
    () => [
      { value: 'ta' as const, label: t('common.tamil') },
      { value: 'en' as const, label: t('common.english') },
    ],
    [t]
  )

  const kycLabels = useMemo(
    () => ({
      upload: t('profile.kyc.upload'),
      replace: t('profile.kyc.replace'),
      pending: t('profile.kyc.pending'),
      approved: t('profile.kyc.approved'),
      rejected: t('profile.kyc.rejected'),
      formatsHint: t('profile.kyc.formatsHint'),
      docTitles: {
        GOVT_ID: t('profile.kyc.govtIdTitle'),
        LAND_RECORD: t('profile.kyc.landRecordTitle'),
        BANK_PROOF: t('profile.kyc.bankProofTitle'),
        GST_CERT: t('profile.kyc.gstCertTitle'),
      },
      docDescriptions: {
        GOVT_ID: t('profile.kyc.govtIdDesc'),
        LAND_RECORD: t('profile.kyc.landRecordDesc'),
        BANK_PROOF: t('profile.kyc.bankProofDesc'),
        GST_CERT: t('profile.kyc.gstCertDesc'),
      },
    }),
    [t]
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">
          {error instanceof Error ? error.message : t('common.error')}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  const kyc = profile.kyc ?? defaultKycSummary(FARMER_DOCUMENT_TYPES)
  const documents = profile.documents ?? []
  const kycContent = kycBannerContent(kyc.status, t)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={t('nav.profile')} description={t('profile.farmerSubtitle')} />

      <KycStatusBanner
        status={kyc.status}
        uploadedCount={kyc.uploadedCount}
        requiredCount={kyc.requiredCount}
        title={kycContent.title}
        message={kycContent.message}
        progressLabel={t('profile.kyc.progress')}
      />

      <ProfileHeroCard
        name={profile.name}
        email={profile.email}
        phone={profile.phone}
        district={profile.district}
        profileImageUrl={profile.profileImageUrl}
        isVerified={profile.isVerified}
        infoMessage={t('profile.kyc.farmerInfoBox')}
        textClass={textClass}
        isUploadingAvatar={avatarMutation.isPending}
        onUploadAvatar={(file) => avatarMutation.mutate(file)}
        labels={{
          verified: t('common.verified'),
          uploadPhoto: t('profile.uploadPhoto'),
          changePhoto: t('profile.changePhoto'),
          memberSinceText: t('profile.memberSince', {
            date: formatDate(profile.createdAt, locale),
          }),
          lastUpdatedText: t('profile.lastUpdated', {
            date: formatDate(profile.updatedAt, locale),
          }),
          photoFormats: t('profile.photoFormats'),
        }}
      />

      <Card className="border-border/80 shadow-card">
        <CardHeader className="pt-6 sm:pt-8">
          <CardTitle>{t('profile.kyc.sectionTitle')}</CardTitle>
          <CardDescription>{t('profile.kyc.sectionSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <KycDocumentsSection
            documentTypes={FARMER_DOCUMENT_TYPES}
            documents={documents}
            uploadingType={uploadingDoc}
            onUpload={(file, type) => documentMutation.mutate({ file, type })}
            title={t('profile.kyc.documentsTitle')}
            subtitle={t('profile.kyc.documentsSubtitle')}
            infoMessage={t('profile.kyc.farmerDocumentsInfo')}
            labels={kycLabels}
          />
          {(documentMutation.error || avatarMutation.error) && (
            <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {(documentMutation.error ?? avatarMutation.error) instanceof Error
                ? (documentMutation.error ?? avatarMutation.error)?.message
                : t('common.error')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-card">
        <CardHeader className="pt-6 sm:pt-8">
          <CardTitle>{t('profile.detailsTitle')}</CardTitle>
          <CardDescription>{t('profile.detailsSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('auth.email')}</label>
              <Input value={profile.email} disabled />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.name')}</label>
                <Input {...register('name')} className={textClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.phone')}</label>
                <Input {...register('phone')} type="tel" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.district')}</label>
                <FormDropdownSelect
                  name="district"
                  control={control}
                  options={districtOptions}
                  ariaLabel={t('profile.district')}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.state')}</label>
                <Input {...register('state')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.farmSize')}</label>
                <Input {...register('farmSize')} placeholder={t('profile.farmSizePlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('profile.cropsGrown')}</label>
                <Input {...register('cropsGrown')} placeholder={t('profile.cropsPlaceholder')} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t('profile.address')}</label>
              <Textarea {...register('address')} rows={3} />
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

            {mutation.error && (
              <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {mutation.error instanceof Error ? mutation.error.message : t('common.error')}
              </p>
            )}

            {success && (
              <p className="rounded-xl bg-success/10 p-3 text-sm text-success">{t('profile.saved')}</p>
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
